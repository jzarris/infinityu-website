"""Pinhole camera helpers. Points are (N,3) in camera coordinates, z forward."""

from __future__ import annotations

import math

import numpy as np


def intrinsics_from_fov(fov_degrees: float, height: int, width: int) -> np.ndarray:
    """Same convention the fitting model uses for its default camera: the field of
    view spans the larger image side, principal point at the image center."""
    f = max(height, width) / (2.0 * math.tan(math.radians(fov_degrees) / 2.0))
    return np.array(
        [[f, 0.0, width / 2.0], [0.0, f, height / 2.0], [0.0, 0.0, 1.0]], dtype=np.float64
    )


def project(points3d: np.ndarray, K: np.ndarray) -> np.ndarray:
    z = np.maximum(points3d[:, 2:3], 1e-6)
    xy = points3d[:, :2] / z
    return xy @ K[:2, :2].T + K[:2, 2]


def fit_intrinsics(points3d: np.ndarray, points2d: np.ndarray) -> np.ndarray:
    """Least-squares fit of focal length and principal point from 3D/2D pairs.

    Used as a diagnostic: if the model projected its own vertices with different
    intrinsics than we assume, this recovers what it actually used.
    """
    z = np.maximum(points3d[:, 2], 1e-6)
    xn = points3d[:, 0] / z
    yn = points3d[:, 1] / z
    n = len(z)
    A = np.zeros((2 * n, 3))
    b = np.zeros(2 * n)
    A[0::2, 0] = xn
    A[0::2, 1] = 1.0
    A[1::2, 0] = yn
    A[1::2, 2] = 1.0
    b[0::2] = points2d[:, 0]
    b[1::2] = points2d[:, 1]
    f, cx, cy = np.linalg.lstsq(A, b, rcond=None)[0]
    return np.array([[f, 0.0, cx], [0.0, f, cy], [0.0, 0.0, 1.0]])


def reprojection_rms(points3d: np.ndarray, points2d: np.ndarray, K: np.ndarray) -> float:
    d = project(points3d, K) - points2d
    return float(np.sqrt(np.mean(np.sum(d * d, axis=1))))
