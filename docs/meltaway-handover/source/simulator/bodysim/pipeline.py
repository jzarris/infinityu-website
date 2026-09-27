"""End-to-end simulation for one photo.

Two stages so the second can be iterated locally on CPU:
  fit_stage        segmentation + body model fit (GPU)      -> BodyFit, mask
  synthesize_stage shape solve + warp + inpaint + labels     -> images
The fit is exported as fit_debug.npz so scripts/rewarp.py can rerun synthesis offline.
"""

from __future__ import annotations

import io
import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field, replace

import numpy as np
from PIL import Image, ImageOps

from . import __version__
from .bodymodel import FOOT_PARTS, HAND_PARTS, HEAD_PARTS, BodyModel, mesh_height, mesh_volume
from .camera import intrinsics_from_fov, project
from .config import SimConfig, SubjectParams
from .fit import BodyFit
from .physiology import bmi, check_target, implied_weight_kg, volume_change_liters
from .render import burn_label, contact_sheet


@dataclass
class SimulationResult:
    record: dict
    images: dict[str, bytes] = field(default_factory=dict)


# Fraction of the whole run completed when each stage *starts*, and a label for
# the person waiting. Variant stages match by prefix (solve_, warp_, inpaint_).
STAGE_START: list[tuple[str, float, str]] = [
    ("decode", 0.00, "Reading your photo"),
    ("segment", 0.03, "Checking the photo"),
    ("load_models", 0.10, "Loading models"),
    ("fit", 0.20, "Fitting your body model"),
    ("measure", 0.60, "Measuring"),
    ("face_landmarks", 0.63, "Finding facial features"),
    ("solve_", 0.68, "Computing your goal shape"),
    ("warp_", 0.74, "Rendering"),
    ("inpaint_", 0.80, "Finishing the background"),
    ("sheet", 0.95, "Packaging"),
]


def stage_progress(name: str) -> tuple[float, str]:
    for key, fraction, label in STAGE_START:
        if name == key or (key.endswith("_") and name.startswith(key)):
            return fraction, label
    return 0.0, "Working"


class Timer:
    """Times stages and optionally reports each stage start via on_stage(name, fraction, label)."""

    def __init__(self, on_stage=None):
        self.stages: dict[str, float] = {}
        self.on_stage = on_stage

    @contextmanager
    def stage(self, name: str):
        if self.on_stage is not None:
            fraction, label = stage_progress(name)
            try:
                self.on_stage(name, fraction, label)
            except Exception:
                pass  # progress reporting must never break a run
        t0 = time.perf_counter()
        try:
            yield
        finally:
            self.stages[name] = round(time.perf_counter() - t0, 3)


def decode_image(image_bytes: bytes, max_side: int) -> tuple[np.ndarray, tuple[int, int]]:
    """Returns (rgb at working size, (original_width, original_height))."""
    im = Image.open(io.BytesIO(image_bytes))
    im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size
    s = max(w, h) / float(max_side)
    if s > 1.0:
        im = im.resize((int(round(w / s)), int(round(h / s))), Image.LANCZOS)
    return np.asarray(im), (w, h)


def png_bytes(rgb: np.ndarray) -> bytes:
    buf = io.BytesIO()
    Image.fromarray(rgb).save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ---- fit export / import -------------------------------------------------

_FIT_ARRAYS = ("betas", "pose", "trans", "vertices3d", "vertices2d", "joints2d", "K", "box", "K_recovered")


def fit_to_npz(fit: BodyFit, mask: np.ndarray) -> bytes:
    buf = io.BytesIO()
    np.savez_compressed(
        buf,
        mask=np.packbits(mask),
        mask_shape=np.array(mask.shape),
        num_people=fit.num_people,
        mean_vertex_uncertainty_mm=fit.mean_vertex_uncertainty_mm,
        reprojection_rms_px=fit.reprojection_rms_px,
        **{k: getattr(fit, k) for k in _FIT_ARRAYS},
    )
    return buf.getvalue()


def fit_from_npz(data: bytes) -> tuple[BodyFit, np.ndarray]:
    z = np.load(io.BytesIO(data))
    shape = tuple(int(x) for x in z["mask_shape"])
    mask = np.unpackbits(z["mask"])[: shape[0] * shape[1]].reshape(shape).astype(bool)
    fit = BodyFit(
        num_people=int(z["num_people"]),
        mean_vertex_uncertainty_mm=float(z["mean_vertex_uncertainty_mm"]),
        reprojection_rms_px=float(z["reprojection_rms_px"]),
        **{k: z[k] for k in _FIT_ARRAYS},
    )
    return fit, mask


# ---- models --------------------------------------------------------------

_models: dict = {}


def load_body_model(models_dir: str, cfg: SimConfig, device: str) -> BodyModel:
    key = ("bm", models_dir, cfg.body_model_type, cfg.body_model_gender, device)
    if key not in _models:
        _models[key] = BodyModel(
            models_dir,
            model_type=cfg.body_model_type,
            gender=cfg.body_model_gender,
            num_betas=cfg.num_betas,
            device=device,
            segmentation_file=os.path.join(models_dir, cfg.segmentation_file),
        )
    return _models[key]


def load_fitter(models_dir: str, cfg: SimConfig, device: str):
    key = ("nlf", models_dir, cfg.nlf_model_file, device)
    if key not in _models:
        from .fit import load_nlf

        _models[key] = load_nlf(os.path.join(models_dir, cfg.nlf_model_file), device)
    return _models[key]


# ---- stage 1: fit ----------------------------------------------------------

class Refused(Exception):
    def __init__(self, reasons: list[str]):
        super().__init__(", ".join(reasons))
        self.reasons = reasons


def fit_stage(rgb: np.ndarray, cfg: SimConfig, models_dir: str, device: str, timer: Timer, record: dict):
    from .fit import capture_gates, fit_body
    from .prefilter import prefilter_mask
    from .segment import person_mask

    H, W = rgb.shape[:2]
    with timer.stage("segment"):
        old_mask = person_mask(rgb, os.path.join(models_dir, cfg.person_seg_model))
        record["mask_coverage"] = round(float(old_mask.mean()), 4)
        pf = prefilter_mask(
            old_mask,
            border_margin_frac=cfg.prefilter_border_margin_frac,
            min_height_frac=cfg.prefilter_min_height_frac,
        )
        if not pf.ok:
            raise Refused(pf.reasons)

    with timer.stage("load_models"):
        nlf = load_fitter(models_dir, cfg, device)

    with timer.stage("fit"):
        K = intrinsics_from_fov(cfg.fov_degrees, H, W)
        fit = fit_body(
            nlf, rgb, K,
            model_name=cfg.body_model_type,
            beta_regularizer=cfg.fit_beta_regularizer,
            num_aug=cfg.fit_num_aug,
        )
        gates = capture_gates(fit, (H, W), cfg.min_subject_height_px, cfg.full_body_margin_px)
        hard = [g for g in gates if g.startswith("not_full_body")]
        if hard:
            raise Refused(["not_full_body"])
        record["warnings"].extend(gates)
        record["fit"] = {
            "num_people": fit.num_people,
            "subject_box_px": [round(float(x), 1) for x in fit.box[:4]],
            "mean_vertex_uncertainty_mm": round(fit.mean_vertex_uncertainty_mm, 2),
            "reprojection_rms_px": round(fit.reprojection_rms_px, 3),
            "focal_assumed": round(float(K[0, 0]), 1),
            "focal_recovered": round(float(fit.K_recovered[0, 0]), 1),
            "betas": [round(float(b), 4) for b in fit.betas],
        }
        if fit.num_people > cfg.max_people:
            record["warnings"].append(f"multiple_people_detected:{fit.num_people}")
        if fit.reprojection_rms_px > 3.0:
            record["warnings"].append("projection_mismatch")
    return fit, old_mask


# ---- stage 2: synthesize --------------------------------------------------

def synthesize_stage(
    rgb: np.ndarray,
    old_mask: np.ndarray,
    fit: BodyFit,
    bm: BodyModel,
    params: SubjectParams,
    cfg: SimConfig,
    timer: Timer,
    record: dict,
) -> dict[str, bytes]:
    import torch

    from .fit import pose_kwargs
    from .shape import solve_target_betas
    from .warp import (
        apply_backward_warp, displacement_field, front_facing, inpaint,
        per_vertex_displacement, revealed_region,
    )

    H, W = rgb.shape[:2]
    K = fit.K
    device = bm.device

    with timer.stage("measure"):
        pose = pose_kwargs(fit.pose, cfg.body_model_type, device)
        with torch.no_grad():
            v_person_posed = bm.vertices(fit.betas, pose, fit.trans)
            v_rest = bm.rest_vertices(fit.betas)
            mesh_h = float(mesh_height(v_rest))
            mesh_vol = float(mesh_volume(v_rest, bm.faces))
        v_person_np = v_person_posed.cpu().numpy()
        regen_rms_mm = float(np.sqrt(np.mean(np.sum((v_person_np - fit.vertices3d) ** 2, axis=1))) * 1000)
        scale = (params.height_cm / 100.0) / mesh_h  # real meters per mesh meter
        real_vol_l = mesh_vol * scale**3 * 1000.0
        implied_w = implied_weight_kg(real_vol_l, cfg)
        ratio = implied_w / params.weight_kg
        meas0 = bm.waist_and_hip(v_rest.cpu().numpy())
        record["measure"] = {
            "mesh_height_m": round(mesh_h, 4),
            "height_scale": round(scale, 4),
            "regen_vs_fit_rms_mm": round(regen_rms_mm, 2),
            "mesh_volume_l_scaled": round(real_vol_l, 2),
            "implied_weight_kg": round(implied_w, 1),
            "implied_over_stated": round(ratio, 3),
            "waist_cm": round(meas0["waist_m"] * scale * 100, 1),
            "hip_cm": round(meas0["hip_m"] * scale * 100, 1),
        }
        if abs(ratio - 1.0) > cfg.implied_weight_tolerance:
            record["warnings"].append("implied_weight_far_from_stated")

    hands = bm.part_indices(HAND_PARTS)
    feet = bm.part_indices(FOOT_PARTS)
    head = bm.part_indices(HEAD_PARTS)
    use = front_facing(fit.vertices3d, bm.faces_np)
    p_src = project(fit.vertices3d, K)
    feather = max(4, int(cfg.feather_frac * max(H, W)))

    # Facial pass: landmark-driven when a face is found, otherwise fall back to a
    # damped version of the mesh delta on the head.
    face_pts = face_disp = None
    face_coef = cfg.face_coefficient
    if cfg.face_landmarks:
        with timer.stage("face_landmarks"):
            from .face import detect_landmarks, face_displacements

            lm = detect_landmarks(rgb, device=device)
            if lm is not None:
                rel = params.delta_kg / params.weight_kg
                face_pts, face_disp = face_displacements(lm, rel, cfg.face_gain, cfg.face_lift_gain)
                face_coef = 0.0  # head mesh holds still; landmarks drive the face
                record["face"] = {"landmarks": True, "relative_loss": round(rel, 3),
                                  "max_face_shift_px": round(float(np.max(np.hypot(*face_disp.T))), 1)}
            else:
                record["face"] = {"landmarks": False}
                record["warnings"].append("face_not_detected")

    panels = [("original", rgb)]
    images: dict[str, bytes] = {"original.png": png_bytes(rgb)}

    for variant in cfg.variants:
        vrec: dict = {"fat_fraction": variant.fat_fraction}
        with timer.stage(f"solve_{variant.name}"):
            dv_l = volume_change_liters(params.delta_kg, variant.fat_fraction, cfg)
            # Remove the same *fraction* of volume from the mesh that the person loses in
            # reality, so a fitter that under- or over-sizes the body does not over- or
            # under-warp. Real body volume is taken from stated weight, not the mesh.
            real_body_l = params.weight_kg / cfg.body_density_kg_per_l
            frac = min(dv_l / real_body_l, 0.6)
            solve_cfg = cfg
            if variant.reg_weights is not None:
                solve_cfg = replace(cfg, solver_reg_weights=variant.reg_weights)
            sol = solve_target_betas(bm, fit.betas, mesh_vol * (1.0 - frac), solve_cfg)
            with torch.no_grad():
                v_rest_t = bm.rest_vertices(sol.betas_target)
                v_target_posed = bm.vertices(sol.betas_target, pose, fit.trans)
            meas1 = bm.waist_and_hip(v_rest_t.cpu().numpy())
            waist_delta_cm = (meas0["waist_m"] - meas1["waist_m"]) * scale * 100
            vrec.update(
                {
                    "volume_change_l": round(dv_l, 2),
                    "solver_iterations": sol.iterations,
                    "volume_rel_error": round(sol.volume_rel_error, 5),
                    "height_rel_error": round(sol.height_rel_error, 5),
                    "beta_delta": [round(float(x), 3) for x in (sol.betas_target - fit.betas)],
                    "beta_delta_norm": round(sol.delta_norm, 3),
                    "waist_after_cm": round(meas1["waist_m"] * scale * 100, 1),
                    "waist_change_cm": round(waist_delta_cm, 1),
                    "waist_cm_per_kg": round(waist_delta_cm / params.delta_kg, 3),
                    "hip_after_cm": round(meas1["hip_m"] * scale * 100, 1),
                }
            )

        with timer.stage(f"warp_{variant.name}"):
            delta3d = v_target_posed.cpu().numpy() - v_person_np
            p_dst_raw = project(fit.vertices3d + delta3d, K)
            d2d, _ = per_vertex_displacement(
                fit.vertices3d, bm.faces_np, p_dst_raw - p_src,
                hands=hands, feet=feet, head=head,
                face_coefficient=face_coef,
                smooth_iters=cfg.scale_smooth_iters,
                hand_contact_m=cfg.hand_contact_m,
            )
            p_dst = p_src + d2d
            src_pts, dst_pts, use_pts = p_src, p_dst, use
            if face_pts is not None:
                src_pts = np.vstack([p_src, face_pts])
                dst_pts = np.vstack([p_dst, face_pts + face_disp])
                use_pts = np.concatenate([use, np.ones(len(face_pts), dtype=bool)])
            fx, fy = displacement_field(
                src_pts, dst_pts, use_pts, (H, W), old_mask,
                feather_px=feather, blur_sigma=cfg.field_blur_sigma, downsample=cfg.field_downsample,
            )
            warped, new_mask = apply_backward_warp(rgb, old_mask, fx, fy)
            region = revealed_region(old_mask, new_mask, cfg.inpaint_dilate_px)
            vrec["max_displacement_px"] = round(float(np.max(np.hypot(fx, fy))), 1)
            vrec["revealed_fraction"] = round(float(region.mean()), 4)

        with timer.stage(f"inpaint_{variant.name}"):
            out = inpaint(warped, region)
            from . import warp as _warp

            vrec["inpainter"] = _warp.LAST_INPAINTER

        loss = params.fmt_delta()
        vrec["waist_change_display"] = params.fmt_length(waist_delta_cm)
        labeled = burn_label(
            out,
            [
                f"{cfg.simulation_label}",
                f"{variant.name}: {loss}  |  {cfg.typical_results_text}",
            ],
        )
        images[f"{variant.name}.png"] = png_bytes(labeled)
        panels.append((f"{variant.name} ({loss})", labeled))
        record["variants"][variant.name] = vrec

    with timer.stage("sheet"):
        images["contact_sheet.png"] = png_bytes(contact_sheet(panels))
    return images


# ---- orchestration ---------------------------------------------------------

def new_record(params: SubjectParams, cfg: SimConfig, timer: Timer) -> dict:
    return {
        "bodysim_version": __version__,
        "params": params.to_dict(),
        "config": cfg.to_dict(),
        "bmi_current": round(bmi(params.weight_kg, params.height_cm), 2),
        "bmi_target": round(bmi(params.target_weight_kg, params.height_cm), 2),
        "refusals": [],
        "warnings": [],
        "variants": {},
        "timings_s": timer.stages,
    }


def run_simulation(
    image_bytes: bytes,
    params: SubjectParams,
    cfg: SimConfig,
    models_dir: str,
    device: str = "cuda",
    on_stage=None,
) -> SimulationResult:
    timer = Timer(on_stage)
    record = new_record(params, cfg, timer)
    record["refusals"] = check_target(params, cfg)
    if record["refusals"]:
        return SimulationResult(record)

    from .prefilter import message_for, prefilter_image

    with timer.stage("decode"):
        rgb, (ow, oh) = decode_image(image_bytes, cfg.work_max_side)
        H, W = rgb.shape[:2]
        record["image"] = {"width": W, "height": H, "original_width": ow, "original_height": oh}
        pf = prefilter_image(ow, oh, cfg.prefilter_min_short_side)
        if not pf.ok:
            record["refusals"] = pf.reasons
            record["user_message"] = pf.message
            return SimulationResult(record)

    try:
        fit, old_mask = fit_stage(rgb, cfg, models_dir, device, timer, record)
    except Refused as e:
        record["refusals"] = e.reasons
        record["user_message"] = message_for(e.reasons)
        return SimulationResult(record)
    except RuntimeError as e:
        record["refusals"] = [str(e)]
        record["user_message"] = message_for([str(e)])
        return SimulationResult(record)

    bm = load_body_model(models_dir, cfg, device)
    images = synthesize_stage(rgb, old_mask, fit, bm, params, cfg, timer, record)
    images["fit_debug.npz"] = fit_to_npz(fit, old_mask)
    record["total_s"] = round(sum(timer.stages.values()), 3)
    return SimulationResult(record, images)
