"""Body model fitting via the NLF TorchScript model.

The model returns, per image, a list of people. For each person:
  pose   (165,) axis-angle rotations for SMPL-X, laid out as
         global_orient[0:3] body[3:66] jaw[66:69] leye[69:72] reye[72:75]
         left_hand[75:120] right_hand[120:165]
  betas  (10,)
  trans  (3,) meters
  vertices3d (10475,3) millimeters, camera coordinates, y down, z forward
  vertices2d (10475,2) pixels
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import torch

from .camera import fit_intrinsics, reprojection_rms


@dataclass
class BodyFit:
    betas: np.ndarray  # (num_betas,)
    pose: np.ndarray  # (165,) or (72,)
    trans: np.ndarray  # (3,) meters
    vertices3d: np.ndarray  # (V,3) meters, camera frame
    vertices2d: np.ndarray  # (V,2) pixels as reported by the model
    joints2d: np.ndarray  # (J,2) pixels
    K: np.ndarray  # intrinsics we passed
    num_people: int
    box: np.ndarray
    mean_vertex_uncertainty_mm: float
    reprojection_rms_px: float
    K_recovered: np.ndarray


def load_nlf(path: str, device: str = "cuda"):
    import torchvision  # noqa: F401  (must be imported for the archive to load)

    model = torch.jit.load(path, map_location=device)
    return model.eval()


def fit_body(
    model,
    rgb: np.ndarray,
    K: np.ndarray,
    model_name: str = "smplx",
    beta_regularizer: float = 0.5,
    num_aug: int = 3,
) -> BodyFit:
    device = next(model.parameters()).device if hasattr(model, "parameters") else "cuda"
    frame = torch.from_numpy(np.array(rgb, copy=True)).permute(2, 0, 1).unsqueeze(0).to(device)
    K_t = torch.from_numpy(K.astype(np.float32)).unsqueeze(0).to(device)

    with torch.inference_mode():
        pred = model.detect_smpl_batched(
            frame,
            intrinsic_matrix=K_t,
            model_name=model_name,
            beta_regularizer=float(beta_regularizer),
            num_aug=int(num_aug),
        )

    boxes = pred["boxes"][0].detach().cpu().numpy()
    num_people = int(len(boxes))
    if num_people == 0:
        raise RuntimeError("no_person_detected")

    # Pick the largest detection. Boxes are [x, y, w, h, (confidence)].
    areas = boxes[:, 2] * boxes[:, 3] if boxes.shape[1] >= 4 else np.ones(num_people)
    i = int(np.argmax(areas))

    betas = pred["betas"][0][i].detach().cpu().numpy().astype(np.float64)
    pose = pred["pose"][0][i].detach().cpu().numpy().astype(np.float64)
    trans = pred["trans"][0][i].detach().cpu().numpy().astype(np.float64)
    v3d = pred["vertices3d"][0][i].detach().cpu().numpy().astype(np.float64) / 1000.0
    v2d = pred["vertices2d"][0][i].detach().cpu().numpy().astype(np.float64)
    j2d = pred["joints2d"][0][i].detach().cpu().numpy().astype(np.float64)
    unc = float(pred["vertex_uncertainties"][0][i].detach().cpu().numpy().mean())

    return BodyFit(
        betas=betas,
        pose=pose,
        trans=trans,
        vertices3d=v3d,
        vertices2d=v2d,
        joints2d=j2d,
        K=K,
        num_people=num_people,
        box=boxes[i],
        mean_vertex_uncertainty_mm=unc,
        reprojection_rms_px=reprojection_rms(v3d, v2d, K),
        K_recovered=fit_intrinsics(v3d, v2d),
    )


def capture_gates(fit: BodyFit, shape: tuple[int, int], min_subject_px: int, margin_px: int) -> list[str]:
    """Cheap checks on the fitted result. Returns warning names (empty = passed).

    SMPL-X joint order: 0 pelvis, 7/8 ankles, 10/11 feet, 15 head.
    """
    H, W = shape
    warnings: list[str] = []
    box_h = float(fit.box[3]) if len(fit.box) >= 4 else float(np.ptp(fit.vertices2d[:, 1]))
    if box_h < min_subject_px:
        warnings.append(f"subject_too_small:{int(box_h)}px")
    j = fit.joints2d
    if j.shape[0] > 15:
        keypoints = {"head": j[15], "l_foot": j[10], "r_foot": j[11], "l_ankle": j[7], "r_ankle": j[8]}
        for name, (x, y) in keypoints.items():
            if not (margin_px <= x < W - margin_px and margin_px <= y < H - margin_px):
                warnings.append(f"not_full_body:{name}_outside_frame")
    return warnings


def pose_kwargs(pose: np.ndarray, model_type: str, device: str) -> dict[str, torch.Tensor]:
    """Unpack a flat rotation-vector pose into body-model keyword arguments."""
    t = lambda a: torch.from_numpy(np.asarray(a, dtype=np.float32)).reshape(1, -1).to(device)  # noqa: E731
    if model_type == "smplx":
        return dict(
            global_orient=t(pose[0:3]),
            body_pose=t(pose[3:66]),
            jaw_pose=t(pose[66:69]),
            leye_pose=t(pose[69:72]),
            reye_pose=t(pose[72:75]),
            left_hand_pose=t(pose[75:120]),
            right_hand_pose=t(pose[120:165]),
        )
    if model_type == "smpl":
        return dict(global_orient=t(pose[0:3]), body_pose=t(pose[3:72]))
    raise ValueError(f"unsupported model type {model_type}")
