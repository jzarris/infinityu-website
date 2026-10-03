"""Re-run the shape solve, warp, and inpaint locally on CPU from a saved fit.

Usage (from simulator/, venv active):
    python scripts/rewarp.py out/minta1 --height-cm 152.4 --weight-kg 68 --target-kg 50 --sex female --age 47
    python scripts/rewarp.py out/minta1 ... --set face_coefficient=0.25 --set solver_reg_weights=1,0.1,1,1,1,1,1,1,1,1

Reads out/<run>/original.png and out/<run>/fit_debug.npz (both written by the Modal run),
uses the SMPL-X model in simulator/models, and writes results to out/<run>/rewarp/.
Inpainting falls back to OpenCV if the LaMa package is not installed locally.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

from bodysim.config import SimConfig, SubjectParams  # noqa: E402
from bodysim.pipeline import Timer, fit_from_npz, load_body_model, new_record, synthesize_stage  # noqa: E402


def _coerce(value: str):
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    if value.lower() == "none":
        return None
    if "," in value:
        return tuple(float(x) for x in value.split(","))
    try:
        return int(value) if value.lstrip("-").isdigit() else float(value)
    except ValueError:
        return value


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir")
    ap.add_argument("--height-cm", type=float, default=0.0)
    ap.add_argument("--weight-kg", type=float, default=0.0)
    ap.add_argument("--target-kg", type=float, default=0.0)
    ap.add_argument("--height-in", type=float, default=0.0)
    ap.add_argument("--weight-lb", type=float, default=0.0)
    ap.add_argument("--target-lb", type=float, default=0.0)
    ap.add_argument("--sex", default="female")
    ap.add_argument("--age", type=int, default=40)
    ap.add_argument("--models", default=str(HERE / "models"))
    ap.add_argument("--set", action="append", default=[], help="config override key=value")
    ap.add_argument("--tag", default="rewarp")
    ap.add_argument("--variants", choices=("fat", "distribution"), default="fat",
                    help="fat: vary fat share of the loss; distribution: vary where it comes off")
    args = ap.parse_args()

    run = Path(args.run_dir)
    rgb = np.asarray(Image.open(run / "original.png").convert("RGB"))
    fit, mask = fit_from_npz((run / "fit_debug.npz").read_bytes())

    cfg = SimConfig()
    if args.variants == "distribution":
        from bodysim.config import DISTRIBUTION_VARIANTS

        cfg.variants = DISTRIBUTION_VARIANTS
    for kv in args.set:
        k, v = kv.split("=", 1)
        if not hasattr(cfg, k):
            raise SystemExit(f"unknown config key {k}")
        setattr(cfg, k, _coerce(v))

    from modal_app import build_params

    params = SubjectParams(**build_params(args.height_cm, args.weight_kg, args.target_kg,
                                          args.height_in, args.weight_lb, args.target_lb,
                                          args.sex, args.age))
    timer = Timer()
    record = new_record(params, cfg, timer)
    bm = load_body_model(args.models, cfg, device="cpu")
    images = synthesize_stage(rgb, mask, fit, bm, params, cfg, timer, record)

    out = run / args.tag
    out.mkdir(exist_ok=True)
    for name, data in images.items():
        (out / name).write_bytes(data)
    (out / "record.json").write_text(json.dumps(record, indent=2))
    print("measure:", json.dumps(record["measure"]))
    disp = record["params"]["display"]
    print(f"subject: {disp['height']}, {disp['weight']} -> {disp['target_weight']} ({disp['loss']})")
    for name, v in record["variants"].items():
        print(f"{name}: waist -{v['waist_change_display']} ({v['waist_cm_per_kg']} cm/kg) "
              f"beta_delta {v['beta_delta']} max shift {v['max_displacement_px']} px "
              f"inpainter={v.get('inpainter')}")
    if any(v.get("inpainter") == "opencv-fallback" for v in record["variants"].values()):
        print("NOTE: OpenCV fallback inpainter was used; the pale halo along the body edge is "
              "from that, not from the warp. Install simple-lama-inpainting locally to match GPU output.")
    print("timings:", json.dumps(timer.stages))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
