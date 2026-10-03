"""Shape delta solver.

Given the fitted shape parameters and a target rest-pose mesh volume, find the
smallest change in shape space that hits the target volume while preserving
height. Because the shape basis is anthropometric, the minimum-norm change
already redistributes non-uniformly (abdomen more than forearms), which is the
effect we want without a hand-authored weight map.

Method: iterative minimum-norm Gauss-Newton. At each step linearize the two
constraints (relative volume, relative height) in the shape parameters and take
the smallest step in the weighted norm that satisfies them:
    d = W^-1 J^T (J W^-1 J^T + lambda I)^-1 r
Per-component weights W let some directions be cheaper (see config).
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import torch

from .bodymodel import BodyModel, mesh_height, mesh_volume
from .config import SimConfig


@dataclass
class ShapeSolution:
    betas_target: np.ndarray
    volume_rel_error: float
    height_rel_error: float
    iterations: int
    delta_norm: float


def _constraints(bm: BodyModel, b: torch.Tensor, vt: torch.Tensor, h0: torch.Tensor) -> torch.Tensor:
    v = bm.rest_vertices(b)
    return torch.stack([mesh_volume(v, bm.faces) / vt, mesh_height(v) / h0])


def solve_target_betas(
    bm: BodyModel, betas_person: np.ndarray, target_volume_m3: float, cfg: SimConfig
) -> ShapeSolution:
    device = bm.device
    b0 = bm._betas(betas_person)
    with torch.no_grad():
        h0 = mesh_height(bm.rest_vertices(b0))
    vt = torch.tensor(float(target_volume_m3), device=device)
    goal = torch.tensor([1.0, 1.0], device=device)  # volume/vt = 1, height/h0 = 1

    n = b0.shape[1]
    w_inv = torch.ones(n, device=device)
    if cfg.solver_reg_weights is not None:
        k = min(len(cfg.solver_reg_weights), n)
        w_inv[:k] = 1.0 / torch.tensor(cfg.solver_reg_weights[:k], dtype=w_inv.dtype, device=device)

    d = torch.zeros(n, device=device)
    lam = 1e-6
    max_iter = max(5, min(cfg.solver_iters, 60))
    it_done = 0
    err = torch.zeros(2, device=device)
    for it in range(max_iter):
        b = (b0[0] + d).detach().requires_grad_(True)
        c = _constraints(bm, b.unsqueeze(0), vt, h0)
        r = goal - c.detach()
        err = r.abs()
        it_done = it + 1
        if bool((err < cfg.solver_tol).all()):
            break
        J = torch.stack([torch.autograd.grad(c[i], b, retain_graph=(i == 0))[0] for i in range(2)])
        JW = J * w_inv  # J W^-1
        A = JW @ J.T + lam * torch.eye(2, device=device)
        step = JW.T @ torch.linalg.solve(A, r)
        d = d + step.detach()

    betas_t = (b0[0] + d).detach().cpu().numpy().astype(np.float64)
    return ShapeSolution(
        betas_target=betas_t,
        volume_rel_error=float(err[0]),
        height_rel_error=float(err[1]),
        iterations=it_done,
        delta_norm=float(torch.norm(d)),
    )
