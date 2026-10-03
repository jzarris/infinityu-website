"""Solver test with a stub body model: a sphere whose radius is set by the shape
parameters. Exercises the optimization loop, the volume and height functions, and
the stopping criteria without the licensed SMPL-X files."""

import numpy as np
import pytest

torch = pytest.importorskip("torch")

from bodysim.bodymodel import mesh_height, mesh_volume  # noqa: E402
from bodysim.config import SimConfig  # noqa: E402
from bodysim.shape import solve_target_betas  # noqa: E402


def _icosphere(subdiv=3):
    t = (1 + 5**0.5) / 2
    v = np.array(
        [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t],
         [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]], float)
    f = np.array(
        [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4],
         [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8],
         [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]])
    v /= np.linalg.norm(v, axis=1, keepdims=True)
    for _ in range(subdiv):
        cache, nf = {}, []
        v = list(v)

        def mid(a, b):
            k = (min(a, b), max(a, b))
            if k not in cache:
                m = (v[a] + v[b]) / 2
                v.append(m / np.linalg.norm(m))
                cache[k] = len(v) - 1
            return cache[k]

        for a, b, c in f:
            ab, bc, ca = mid(a, b), mid(b, c), mid(c, a)
            nf += [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]
        v, f = np.array(v), np.array(nf)
    return v, f


class StubModel:
    """radius_x = radius_z = 1 + 0.1*b0, radius_y = 1 + 0.1*b1 (height axis)."""

    def __init__(self):
        v, f = _icosphere(3)
        self.base = torch.tensor(v, dtype=torch.float32)
        self.faces = torch.tensor(f, dtype=torch.int64)
        self.faces_np = f
        self.device = "cpu"
        self.num_betas = 10

    def _betas(self, b):
        return torch.as_tensor(np.asarray(b, np.float32)).reshape(1, -1)

    def rest_vertices(self, betas):
        b = betas if isinstance(betas, torch.Tensor) else self._betas(betas)
        sx = 1 + 0.1 * b[0, 0]
        sy = 1 + 0.1 * b[0, 1]
        return self.base * torch.stack([sx, sy, sx])


def test_volume_and_height_of_unit_sphere():
    m = StubModel()
    v = m.rest_vertices(np.zeros(10))
    vol = float(mesh_volume(v, m.faces))
    assert abs(vol - 4 / 3 * np.pi) < 0.05  # icosphere slightly under-fills
    assert abs(float(mesh_height(v)) - 2.0) < 1e-5


def test_solver_hits_target_volume_and_keeps_height():
    m = StubModel()
    cfg = SimConfig()
    b0 = np.zeros(10)
    v0 = float(mesh_volume(m.rest_vertices(b0), m.faces))
    target = v0 * 0.85
    sol = solve_target_betas(m, b0, target, cfg)
    assert sol.volume_rel_error < cfg.solver_tol
    assert sol.height_rel_error < cfg.solver_tol
    assert sol.iterations < 15
    # volume shrank via the width parameter, not the height parameter
    assert sol.betas_target[0] < -0.3
    assert abs(sol.betas_target[1]) < 0.02
    # unused components stay at zero: minimum norm
    assert np.all(np.abs(sol.betas_target[2:]) < 1e-6)


def test_solver_honors_reg_weights():
    m = StubModel()
    b0 = np.zeros(10)
    v0 = float(mesh_volume(m.rest_vertices(b0), m.faces))
    # Only component 0 can change volume without changing height, so weights cannot
    # redirect it; but a cheap weight must not change the constraint satisfaction.
    cfg = SimConfig(solver_reg_weights=(0.1, 1, 1, 1, 1, 1, 1, 1, 1, 1))
    sol = solve_target_betas(m, b0, v0 * 0.9, cfg)
    assert sol.volume_rel_error < cfg.solver_tol and sol.height_rel_error < cfg.solver_tol
