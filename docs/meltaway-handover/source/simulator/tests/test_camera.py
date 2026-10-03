import numpy as np

from bodysim.camera import fit_intrinsics, intrinsics_from_fov, project, reprojection_rms


def test_fov_intrinsics_center():
    K = intrinsics_from_fov(55, 960, 720)
    assert K[0, 2] == 360 and K[1, 2] == 480
    assert K[0, 0] == K[1, 1] > 0


def test_fit_intrinsics_recovers_projection():
    rng = np.random.default_rng(0)
    K = intrinsics_from_fov(55, 1000, 800)
    pts = rng.normal(size=(500, 3)) * [0.4, 0.8, 0.2] + [0, 0, 3.0]
    uv = project(pts, K)
    K2 = fit_intrinsics(pts, uv)
    assert np.allclose(K2, K, atol=1e-6)
    assert reprojection_rms(pts, uv, K2) < 1e-6
