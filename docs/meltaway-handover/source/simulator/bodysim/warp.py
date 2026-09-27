"""Mesh-driven dense image warp.

Given projected vertex positions before and after the shape change, build a
dense backward displacement field over the image, remap the pixels, and inpaint
the background revealed where the silhouette shrank.
"""

from __future__ import annotations

import numpy as np


def vertex_normals(verts: np.ndarray, faces: np.ndarray) -> np.ndarray:
    fn = np.cross(verts[faces[:, 1]] - verts[faces[:, 0]], verts[faces[:, 2]] - verts[faces[:, 0]])
    vn = np.zeros_like(verts)
    for k in range(3):
        np.add.at(vn, faces[:, k], fn)
    n = np.linalg.norm(vn, axis=1, keepdims=True)
    return vn / np.maximum(n, 1e-12)


def front_facing(verts_cam: np.ndarray, faces: np.ndarray) -> np.ndarray:
    """Vertices whose normal points toward a camera at the origin."""
    n = vertex_normals(verts_cam, faces)
    view = verts_cam / np.maximum(np.linalg.norm(verts_cam, axis=1, keepdims=True), 1e-12)
    return np.sum(n * view, axis=1) < 0.0


def vertex_adjacency(faces: np.ndarray, n: int):
    """Returns (src, dst) index arrays for every directed edge and per-vertex degree."""
    e = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]], axis=0)
    e = np.concatenate([e, e[:, ::-1]], axis=0)
    e = np.unique(e, axis=0)
    deg = np.bincount(e[:, 0], minlength=n).astype(np.float64)
    return e[:, 0], e[:, 1], np.maximum(deg, 1.0)


def smooth_on_mesh(values: np.ndarray, faces: np.ndarray, iters: int, pinned: np.ndarray | None = None,
                   pinned_values: np.ndarray | None = None) -> np.ndarray:
    """Iterated neighbor averaging of a per-vertex scalar. Pinned vertices are reset each
    iteration so their value diffuses outward as a ramp instead of being smoothed away."""
    s = values.astype(np.float64).copy()
    src, dst, deg = vertex_adjacency(faces, len(s))
    for _ in range(iters):
        acc = np.zeros_like(s)
        np.add.at(acc, src, s[dst])
        s = 0.5 * s + 0.5 * acc / deg
        if pinned is not None:
            s[pinned] = pinned_values
    return s


def per_vertex_displacement(
    v_person: np.ndarray,
    faces: np.ndarray,
    d_raw: np.ndarray,
    hands: np.ndarray,
    feet: np.ndarray,
    head: np.ndarray,
    face_coefficient: float,
    smooth_iters: int = 40,
    hand_contact_m: float = 0.06,
) -> tuple[np.ndarray, np.ndarray]:
    """Turn the raw mesh delta into the displacement we actually apply.

    - Hands within contact distance of the body take the displacement of the surface
      they touch (hands on hips move with the hips). Otherwise they keep their own.
    - Feet are held still (floor contact). The scale ramps up the shin via smoothing.
    - The head moves at `face_coefficient` of its raw delta, blended into the neck.
    Returns (displacement (N,2 or 3), scale (N,)).
    """
    from scipy.spatial import cKDTree

    n = len(v_person)
    d = d_raw.copy()

    body = np.ones(n, dtype=bool)
    body[hands] = False
    body[feet] = False
    body_idx = np.where(body)[0]
    if len(hands) and len(body_idx):
        dist, nn = cKDTree(v_person[body_idx]).query(v_person[hands])
        touching = dist < hand_contact_m
        d[hands[touching]] = d[body_idx[nn[touching]]]

    scale = np.ones(n, dtype=np.float64)
    scale[head] = face_coefficient
    scale[feet] = 0.0
    # Feet are always pinned. When the face is driven by landmarks (coefficient 0) the
    # head is pinned too, so the neck ramps between shoulders and a still head instead
    # of the trunk's displacement diffusing into the face.
    pinned = np.concatenate([feet, head]) if face_coefficient == 0.0 else feet
    pinned_values = np.zeros(len(pinned))
    scale = smooth_on_mesh(scale, faces, smooth_iters, pinned=pinned, pinned_values=pinned_values)
    return d * scale[:, None], scale


def displacement_field(
    p_src: np.ndarray,
    p_dst: np.ndarray,
    use: np.ndarray,
    shape: tuple[int, int],
    old_mask: np.ndarray,
    feather_px: int = 48,
    blur_sigma: float = 3.0,
    downsample: int = 4,
) -> tuple[np.ndarray, np.ndarray]:
    """Dense displacement (dx, dy) in target-image space, float32 (H,W) each.

    p_src/p_dst are (N,2) pixel positions of the same vertices before and after
    the shape change. `use` selects the vertices that drive the field (front
    facing). The field is keyed on destination positions so it can be used as a
    backward map: output pixel q samples the source at q - D(q).
    """
    import cv2
    from scipy.interpolate import griddata
    from scipy.ndimage import distance_transform_edt

    H, W = shape
    d = (p_dst - p_src)[use]
    keys = p_dst[use]

    s = max(1, int(downsample))
    hs, ws = (H + s - 1) // s, (W + s - 1) // s
    gy, gx = np.mgrid[0:hs, 0:ws]
    xi = np.stack([gx.ravel() * s, gy.ravel() * s], axis=1).astype(np.float64)

    lin = griddata(keys, d, xi, method="linear")
    near = griddata(keys, d, xi, method="nearest")
    bad = ~np.isfinite(lin[:, 0])
    lin[bad] = near[bad]
    fx = lin[:, 0].reshape(hs, ws).astype(np.float32)
    fy = lin[:, 1].reshape(hs, ws).astype(np.float32)
    fx = cv2.resize(fx, (W, H), interpolation=cv2.INTER_LINEAR)
    fy = cv2.resize(fy, (W, H), interpolation=cv2.INTER_LINEAR)

    # Let displacement fade to zero outside the old silhouette so the background stays put.
    dist_out = distance_transform_edt(~old_mask)
    w = np.clip(1.0 - dist_out / float(max(feather_px, 1)), 0.0, 1.0).astype(np.float32)
    fx *= w
    fy *= w

    if blur_sigma > 0:
        k = int(6 * blur_sigma + 1) | 1
        fx = cv2.GaussianBlur(fx, (k, k), blur_sigma)
        fy = cv2.GaussianBlur(fy, (k, k), blur_sigma)
    return fx, fy


def apply_backward_warp(
    img: np.ndarray, mask: np.ndarray, fx: np.ndarray, fy: np.ndarray
) -> tuple[np.ndarray, np.ndarray]:
    import cv2

    H, W = fx.shape
    gy, gx = np.mgrid[0:H, 0:W].astype(np.float32)
    map_x = gx - fx
    map_y = gy - fy
    warped = cv2.remap(img, map_x, map_y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT101)
    m = cv2.remap(mask.astype(np.float32), map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return warped, m > 0.5


def revealed_region(old_mask: np.ndarray, new_mask: np.ndarray, dilate_px: int = 3) -> np.ndarray:
    import cv2

    region = old_mask & ~new_mask
    if dilate_px > 0:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dilate_px + 1, 2 * dilate_px + 1))
        region = cv2.dilate(region.astype(np.uint8), k) > 0
        # never paint over the person as they now stand
        region &= ~new_mask
    return region


_lama = None
LAST_INPAINTER = "none"  # "lama" or "opencv-fallback"; recorded per variant in record.json


def inpaint(img: np.ndarray, region: np.ndarray) -> np.ndarray:
    """Fill `region` (bool) with plausible background. LaMa if available, else OpenCV.

    The OpenCV fallback produces a visible pale halo along the old silhouette; it is
    only there so the geometry can be judged locally without the LaMa weights.
    """
    global _lama, LAST_INPAINTER
    if not region.any():
        return img
    try:
        from PIL import Image
        from simple_lama_inpainting import SimpleLama

        if _lama is None:
            _lama = SimpleLama()
        out = _lama(Image.fromarray(img), Image.fromarray((region.astype(np.uint8) * 255)))
        out = np.asarray(out.convert("RGB"))
        h, w = img.shape[:2]
        LAST_INPAINTER = "lama"
        return out[:h, :w]
    except Exception as e:  # pragma: no cover - fallback path
        import cv2

        print(f"[warp] LaMa unavailable ({e!r}); falling back to cv2.inpaint (expect a halo)")
        LAST_INPAINTER = "opencv-fallback"
        return cv2.inpaint(img, region.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
