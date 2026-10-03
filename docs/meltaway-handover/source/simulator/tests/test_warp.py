import numpy as np

from bodysim.warp import apply_backward_warp, displacement_field, front_facing, revealed_region


def _disc_mask(H, W, cx, cy, r):
    yy, xx = np.mgrid[0:H, 0:W]
    return (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r


def test_front_facing_sphere():
    # points on a sphere in front of the camera; the near hemisphere faces the camera
    n = 2000
    rng = np.random.default_rng(1)
    v = rng.normal(size=(n, 3))
    v /= np.linalg.norm(v, axis=1, keepdims=True)
    from scipy.spatial import ConvexHull

    faces = ConvexHull(v).simplices
    # orient faces outward
    c = v[faces].mean(1)
    nrm = np.cross(v[faces[:, 1]] - v[faces[:, 0]], v[faces[:, 2]] - v[faces[:, 0]])
    flip = np.sum(nrm * c, 1) < 0
    faces[flip] = faces[flip][:, [0, 2, 1]]
    cam = v + [0, 0, 3.0]
    ff = front_facing(cam, faces)
    assert 0.35 < ff.mean() < 0.65
    assert ff[v[:, 2] < -0.5].mean() > 0.9
    assert ff[v[:, 2] > 0.5].mean() < 0.1


def test_inward_displacement_shrinks_mask_and_reveals_background():
    H, W = 200, 160
    mask = _disc_mask(H, W, 80, 100, 50)
    ang = np.linspace(0, 2 * np.pi, 200, endpoint=False)
    p_src = np.stack([80 + 50 * np.cos(ang), 100 + 50 * np.sin(ang)], 1)
    p_dst = np.stack([80 + 40 * np.cos(ang), 100 + 40 * np.sin(ang)], 1)
    # add a few interior points with proportional displacement
    inner = np.stack([80 + 20 * np.cos(ang[::10]), 100 + 20 * np.sin(ang[::10])], 1)
    p_src = np.vstack([p_src, inner])
    p_dst = np.vstack([p_dst, [80, 100] + (inner - [80, 100]) * 0.8])
    use = np.ones(len(p_src), bool)
    fx, fy = displacement_field(p_src, p_dst, use, (H, W), mask, feather_px=20, blur_sigma=1.0, downsample=2)
    img = np.zeros((H, W, 3), np.uint8)
    img[mask] = 200
    warped, new_mask = apply_backward_warp(img, mask, fx, fy)
    assert new_mask.sum() < mask.sum() * 0.8
    assert new_mask.sum() > mask.sum() * 0.5
    region = revealed_region(mask, new_mask, 2)
    assert region.any() and not (region & new_mask).any()
    # far from the disc nothing moved
    assert abs(fx[5, 5]) < 1e-3 and abs(fy[5, 5]) < 1e-3
