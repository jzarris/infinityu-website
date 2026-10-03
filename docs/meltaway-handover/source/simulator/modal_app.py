"""Modal entrypoint for the body simulator prototype.

Setup (once):
    modal setup
    modal run modal_app.py::download_models
    # register at https://smpl-x.is.tue.mpg.de, download SMPL-X (npz), then:
    modal volume put bodysim-models /path/to/SMPLX_NEUTRAL.npz /smplx/SMPLX_NEUTRAL.npz

Run (metric or imperial; labels come back in whichever you used):
    modal run modal_app.py --photo samples/me.jpg --height-cm 170 --weight-kg 95 --target-kg 80 --sex female --age 42
    modal run modal_app.py --photo samples/me.jpg --height-in 67 --weight-lb 210 --target-lb 176 --sex female --age 42
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import modal

APP_NAME = "bodysim"
MODELS_PATH = "/models"
NLF_URL = "https://github.com/isarandi/nlf/releases/download/v0.3.2/nlf_l_multi_0.3.2.torchscript"
NLF_FILE = "nlf/nlf_l_multi_0.3.2.torchscript"
SEG_URL = (
    "https://github.com/Meshcapade/wiki/raw/refs/heads/main/assets/SMPL_body_segmentation/"
    "smplx/smplx_vert_segmentation.json"
)
SEG_FILE = "smplx_vert_segmentation.json"
U2NET_URL = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx"
U2NET_FILE = "u2net/u2net_human_seg.onnx"

app = modal.App(APP_NAME)
models_volume = modal.Volume.from_name("bodysim-models", create_if_missing=True)
# Per-call progress published by the running simulation and read by `result`.
progress_dict = modal.Dict.from_name("bodysim-progress", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0", "curl", "fonts-dejavu-core")
    .pip_install(
        "torch==2.7.1",  # NLF 0.3.2 TorchScript was exported on a 2025 torch; stay at or above it
        "torchvision==0.22.1",
        "numpy<2",  # simple-lama-inpainting pins numpy 1.x
        "pillow<10",  # and pillow 9.x
        "scipy",
        "opencv-python-headless",
        "onnxruntime",
        "smplx",
        "simple-lama-inpainting",
        "face-alignment",  # 68-point face landmarks for the facial pass (weights cached in TORCH_HOME)
        "fastapi[standard]",  # web endpoints used by the site (submit / result)
    )
    .env(
        {
            "TORCH_HOME": f"{MODELS_PATH}/torch",  # LaMa weights cache under here
            "PYTHONUNBUFFERED": "1",
        }
    )
    .add_local_python_source("bodysim")
)


@app.function(image=image, volumes={MODELS_PATH: models_volume}, timeout=1800)
def download_models() -> dict:
    """Fetch the public model files into the volume and report what is still missing."""
    import subprocess

    status = {}
    nlf_path = Path(MODELS_PATH) / NLF_FILE
    nlf_path.parent.mkdir(parents=True, exist_ok=True)
    if not nlf_path.exists():
        subprocess.run(["curl", "-L", "--fail", "-o", str(nlf_path), NLF_URL], check=True)
    status["nlf"] = nlf_path.exists()

    seg_path = Path(MODELS_PATH) / SEG_FILE
    if not seg_path.exists():
        subprocess.run(["curl", "-L", "--fail", "-o", str(seg_path), SEG_URL], check=True)
    status["segmentation"] = seg_path.exists()

    u2net_path = Path(MODELS_PATH) / U2NET_FILE
    u2net_path.parent.mkdir(parents=True, exist_ok=True)
    if not u2net_path.exists():
        subprocess.run(["curl", "-L", "--fail", "-o", str(u2net_path), U2NET_URL], check=True)
    status["u2net"] = u2net_path.exists()

    # Warm the inpainting model cache so the first simulation does not pay for the download.
    try:
        from simple_lama_inpainting import SimpleLama

        SimpleLama()
        status["lama"] = True
    except Exception as e:  # pragma: no cover
        status["lama"] = f"failed: {e!r}"

    try:
        import numpy as np

        from bodysim.face import detect_landmarks

        detect_landmarks(np.zeros((256, 256, 3), dtype=np.uint8))  # downloads the weights
        status["face_alignment"] = True
    except Exception as e:  # pragma: no cover
        status["face_alignment"] = f"failed: {e!r}"

    smplx_path = Path(MODELS_PATH) / "smplx" / "SMPLX_NEUTRAL.npz"
    status["smplx"] = smplx_path.exists()
    models_volume.commit()
    if not smplx_path.exists():
        print(
            "\nSMPL-X body model not found. Register at https://smpl-x.is.tue.mpg.de, download the\n"
            "npz models, then upload with:\n"
            "  modal volume put bodysim-models /local/path/SMPLX_NEUTRAL.npz /smplx/SMPLX_NEUTRAL.npz\n"
        )
    print(json.dumps(status, indent=2))
    return status


def _apply_overrides(cfg, overrides: dict | None):
    """Apply JSON-friendly config overrides. `variants` may be a list of dicts."""
    from bodysim.config import VariantSpec

    for k, v in (overrides or {}).items():
        if not hasattr(cfg, k):
            raise ValueError(f"unknown config key {k}")
        if k == "variants":
            v = tuple(
                VariantSpec(
                    name=str(d["name"]),
                    fat_fraction=float(d.get("fat_fraction", 0.75)),
                    reg_weights=tuple(d["reg_weights"]) if d.get("reg_weights") else None,
                )
                for d in v
            )
        elif k == "solver_reg_weights" and v is not None:
            v = tuple(float(x) for x in v)
        setattr(cfg, k, v)
    return cfg


@app.function(
    image=image,
    gpu="A10",
    volumes={MODELS_PATH: models_volume},
    timeout=900,
    scaledown_window=600,  # keep a warm container for 10 min so back-to-back users skip the cold start
)
def simulate(image_bytes: bytes, params: dict, overrides: dict | None = None) -> dict:
    """Run one simulation. Returns {'record': dict, 'images': {name: png_bytes}}."""
    from bodysim.config import SimConfig, SubjectParams
    from bodysim.pipeline import run_simulation

    import time

    cfg = _apply_overrides(SimConfig(), overrides)
    call_id = modal.current_function_call_id()

    def on_stage(name: str, fraction: float, label: str) -> None:
        if call_id:
            progress_dict[call_id] = {"stage": name, "fraction": fraction, "label": label, "t": time.time()}

    try:
        result = run_simulation(
            image_bytes, SubjectParams(**params), cfg, MODELS_PATH, device="cuda", on_stage=on_stage
        )
        return {"record": result.record, "images": result.images}
    finally:
        if call_id:
            try:
                progress_dict.pop(call_id)
            except KeyError:
                pass


# ---------------------------------------------------------------------------
# Web endpoints for the site. Deploy with `modal deploy modal_app.py`; the
# printed URLs go into SIMULATOR_SUBMIT_URL / SIMULATOR_RESULT_URL on the site,
# and the bearer token comes from the Modal secret `bodysim-api`
# (create with: modal secret create bodysim-api SIM_API_TOKEN=<random>).
# The service keeps nothing: bytes in with the request, results out, then gone.
# ---------------------------------------------------------------------------

api_secret = modal.Secret.from_name("bodysim-api")

# Imported inside the container image (and locally when fastapi is installed);
# FastAPI needs the real Request class to recognize the parameter.
with image.imports():
    from fastapi import HTTPException, Request


def _authorized(request) -> bool:
    """Bearer auth. SIM_API_TOKEN may hold several comma-separated tokens so more
    than one site (e.g. meltawaymd.com and infinity-u.com) can share this service,
    each with its own credential that can be rotated independently."""
    import hmac

    expected = [t.strip() for t in os.environ.get("SIM_API_TOKEN", "").split(",") if t.strip()]
    header = request.headers.get("authorization", "")
    token = header[7:] if header.lower().startswith("bearer ") else ""
    return bool(token) and any(hmac.compare_digest(token, e) for e in expected)


@app.function(image=image, secrets=[api_secret])
@modal.fastapi_endpoint(method="POST")
def submit(payload: dict, request: Request):
    """Start a simulation. Body: {image_b64, params, overrides?}. Returns {call_id}."""
    import base64

    if not _authorized(request):
        raise HTTPException(status_code=401, detail="unauthorized")
    try:
        image_bytes = base64.b64decode(payload["image_b64"], validate=True)
        params = dict(payload["params"])
    except Exception:
        raise HTTPException(status_code=400, detail="bad request")
    if len(image_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="image too large")
    call = simulate.spawn(image_bytes, params, payload.get("overrides") or None)
    return {"call_id": call.object_id}


@app.function(image=image, secrets=[api_secret])
@modal.fastapi_endpoint(method="GET")
def result(id: str, request: Request):
    """Poll a simulation. Returns {status: pending} | {status: done, record, images(b64)} | {status: failed, error}."""
    import base64

    if not _authorized(request):
        raise HTTPException(status_code=401, detail="unauthorized")
    try:
        call = modal.FunctionCall.from_id(id)
    except Exception:
        raise HTTPException(status_code=404, detail="unknown call")
    try:
        out = call.get(timeout=0)
    except TimeoutError:
        progress = progress_dict.get(id)
        if progress:
            return {"status": "pending", "stage": progress.get("stage"), "fraction": progress.get("fraction"),
                    "label": progress.get("label")}
        return {"status": "pending", "stage": "starting", "fraction": 0.0, "label": "Starting up"}
    except Exception as e:  # the simulation itself raised
        return {"status": "failed", "error": type(e).__name__}
    images = {k: base64.b64encode(v).decode("ascii") for k, v in out["images"].items()}
    return {"status": "done", "record": out["record"], "images": images}


def build_params(height_cm=0.0, weight_kg=0.0, target_kg=0.0, height_in=0.0, weight_lb=0.0,
                 target_lb=0.0, sex="female", age=40) -> dict:
    """Accept either a full metric set or a full imperial set. Returns SubjectParams kwargs."""
    from bodysim.config import SubjectParams

    metric = (height_cm, weight_kg, target_kg)
    imperial = (height_in, weight_lb, target_lb)
    if all(v > 0 for v in imperial) and not any(v > 0 for v in metric):
        p = SubjectParams.from_imperial(height_in, weight_lb, target_lb, sex, age)
    elif all(v > 0 for v in metric) and not any(v > 0 for v in imperial):
        p = SubjectParams(height_cm, weight_kg, target_kg, sex, age)
    else:
        raise SystemExit(
            "Give either --height-cm --weight-kg --target-kg, or --height-in --weight-lb --target-lb (not a mix)."
        )
    d = p.to_dict()
    d.pop("display")
    return d


@app.local_entrypoint()
def main(
    photo: str,
    height_cm: float = 0.0,
    weight_kg: float = 0.0,
    target_kg: float = 0.0,
    height_in: float = 0.0,
    weight_lb: float = 0.0,
    target_lb: float = 0.0,
    sex: str = "female",
    age: int = 40,
    out: str = "out",
    typical_results: str = "",
):
    photo_path = Path(photo)
    params = build_params(height_cm, weight_kg, target_kg, height_in, weight_lb, target_lb, sex, age)
    overrides = {"typical_results_text": typical_results} if typical_results else None

    result = simulate.remote(photo_path.read_bytes(), params, overrides)
    record, images = result["record"], result["images"]

    out_dir = Path(out) / photo_path.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "record.json").write_text(json.dumps(record, indent=2))
    for name, data in images.items():
        (out_dir / name).write_bytes(data)

    print(json.dumps({k: record[k] for k in ("refusals", "warnings", "timings_s") if k in record}, indent=2))
    if record.get("refusals"):
        print("\nREFUSED. Message shown to the user:\n" + record.get("user_message", "") + "\n")
    if record.get("warnings"):
        print("\n!! WARNINGS above mean the photo does not meet capture requirements; "
              "judge the output accordingly.\n")
    if "fit" in record:
        print("fit:", json.dumps({k: record["fit"][k] for k in ("num_people", "subject_box_px", "mean_vertex_uncertainty_mm")}))
    if "measure" in record:
        print("measure:", json.dumps(record["measure"]))
    disp = record["params"]["display"]
    print(f"subject: {disp['height']}, {disp['weight']} -> {disp['target_weight']} ({disp['loss']})")
    for name, v in record.get("variants", {}).items():
        print(f"{name}: waist -{v['waist_change_display']} ({v['waist_cm_per_kg']} cm/kg), "
              f"max shift {v['max_displacement_px']} px, solver {v['solver_iterations']} it")
    print(f"wrote {len(images)} images to {out_dir}")
