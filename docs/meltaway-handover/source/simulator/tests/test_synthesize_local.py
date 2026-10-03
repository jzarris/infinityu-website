"""Smoke test of the synthesis stage with a fabricated fit. Requires the SMPL-X
model in simulator/models; skipped otherwise. Verifies the code path end to end
on CPU: measurements, solver, displacement, warp, inpaint fallback, labels, and
the fit export/import round trip."""

import os
from pathlib import Path

import numpy as np
import pytest

torch = pytest.importorskip("torch")
cv2 = pytest.importorskip("cv2")

MODELS = Path(__file__).resolve().parent.parent / "models"
pytestmark = pytest.mark.skipif(
    not (MODELS / "smplx" / "SMPLX_NEUTRAL.npz").exists(), reason="SMPL-X model not present"
)

from bodysim.camera import intrinsics_from_fov, project  # noqa: E402
from bodysim.config import SimConfig, SubjectParams  # noqa: E402
from bodysim.fit import BodyFit  # noqa: E402
from bodysim.pipeline import Timer, fit_from_npz, fit_to_npz, load_body_model, new_record, synthesize_stage  # noqa: E402


def _fake_fit(bm, betas, H, W):
    with torch.no_grad():
        v = bm.rest_vertices(betas).numpy().astype(np.float64)
    v = v * [1, -1, 1] + [0, 0.05, 3.2]  # y-down camera frame, 3.2 m away
    K = intrinsics_from_fov(55, H, W)
    v2d = project(v, K)
    joints2d = np.tile(v2d.mean(0), (55, 1))
    joints2d[15] = v2d[v2d[:, 1].argmin()]  # head at the top
    joints2d[[10, 11]] = v2d[v2d[:, 1].argmax()]  # feet at the bottom
    pose = np.zeros(165)
    x0, y0 = v2d.min(0)
    x1, y1 = v2d.max(0)
    return BodyFit(
        betas=np.asarray(betas, float), pose=pose, trans=np.array([0, 0.05, 3.2]),
        vertices3d=v, vertices2d=v2d, joints2d=joints2d, K=K, num_people=1,
        box=np.array([x0, y0, x1 - x0, y1 - y0, 0.9]), mean_vertex_uncertainty_mm=30.0,
        reprojection_rms_px=0.0, K_recovered=K,
    ), v2d


def test_synthesize_stage_runs_and_roundtrips():
    H, W = 1280, 720
    cfg = SimConfig()
    bm = load_body_model(str(MODELS), cfg, "cpu")
    betas = np.array([-0.33, 0.58, 0.08, 0.02, 0.01, -0.03, 0.02, -0.01, 0.0, 0.0])
    fit, v2d = _fake_fit(bm, betas, H, W)

    mask = np.zeros((H, W), np.uint8)
    for x, y in v2d.astype(int):
        if 0 <= x < W and 0 <= y < H:
            cv2.circle(mask, (int(x), int(y)), 6, 255, -1)
    mask = mask > 0
    rgb = np.full((H, W, 3), 180, np.uint8)
    rgb[mask] = (120, 90, 70)

    # export / import round trip
    fit2, mask2 = fit_from_npz(fit_to_npz(fit, mask))
    assert np.array_equal(mask, mask2)
    assert np.allclose(fit2.vertices3d, fit.vertices3d)

    params = SubjectParams(152.4, 68.0, 50.0, "female", 47)
    timer = Timer()
    record = new_record(params, cfg, timer)
    images = synthesize_stage(rgb, mask, fit2, bm, params, cfg, timer, record)

    assert set(images) >= {"original.png", "conservative.png", "expected.png", "optimistic.png", "contact_sheet.png"}
    for name, v in record["variants"].items():
        assert v["volume_rel_error"] < cfg.solver_tol * 2
        assert v["waist_change_cm"] > 5
        assert 0 < v["max_displacement_px"] < 80
    assert 0.5 < record["measure"]["implied_over_stated"] < 1.5
