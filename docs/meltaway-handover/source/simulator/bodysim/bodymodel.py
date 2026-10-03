"""SMPL-X wrapper: mesh generation, measurements, and vertex part lookup."""

from __future__ import annotations

import json
import os

import numpy as np
import torch

TORSO_PARTS = ("spine", "spine1", "spine2", "hips")
HEAD_PARTS = ("head", "leftEye", "rightEye", "eyeballs")
NECK_PARTS = ("neck",)
HAND_PARTS = ("leftHand", "rightHand", "leftHandIndex1", "rightHandIndex1")
FOOT_PARTS = ("leftFoot", "rightFoot", "leftToeBase", "rightToeBase")


def mesh_volume(verts: torch.Tensor, faces: torch.Tensor) -> torch.Tensor:
    """Signed volume of a closed triangle mesh via the divergence theorem. (V,3) -> scalar."""
    v0 = verts[faces[:, 0]]
    v1 = verts[faces[:, 1]]
    v2 = verts[faces[:, 2]]
    return torch.abs(torch.sum(torch.sum(v0 * torch.cross(v1, v2, dim=1), dim=1)) / 6.0)


def mesh_height(verts: torch.Tensor) -> torch.Tensor:
    return verts[:, 1].max() - verts[:, 1].min()


class BodyModel:
    def __init__(
        self,
        models_dir: str,
        model_type: str = "smplx",
        gender: str = "neutral",
        num_betas: int = 10,
        device: str = "cuda",
        segmentation_file: str | None = None,
    ):
        import smplx

        self.model_type = model_type
        self.device = device
        self.num_betas = num_betas
        self.model = smplx.create(
            model_path=models_dir,
            model_type=model_type,
            gender=gender,
            use_pca=False,
            num_betas=num_betas,
            ext="npz",
            batch_size=1,
        ).to(device)
        self.model.eval()
        self.faces_np = np.asarray(self.model.faces, dtype=np.int64)
        self.faces = torch.from_numpy(self.faces_np).to(device)

        self.segmentation: dict[str, list[int]] | None = None
        if segmentation_file and os.path.exists(segmentation_file) and model_type == "smplx":
            with open(segmentation_file) as f:
                self.segmentation = json.load(f)

    # ---- mesh generation -------------------------------------------------

    def _betas(self, betas) -> torch.Tensor:
        b = torch.as_tensor(np.asarray(betas, dtype=np.float32)).reshape(1, -1).to(self.device)
        if b.shape[1] < self.num_betas:
            b = torch.cat([b, torch.zeros(1, self.num_betas - b.shape[1], device=self.device)], 1)
        return b[:, : self.num_betas]

    def vertices(self, betas, pose: dict | None = None, transl=None) -> torch.Tensor:
        """Posed vertices (V,3) meters. betas may carry a gradient."""
        b = betas if isinstance(betas, torch.Tensor) else self._betas(betas)
        kwargs = dict(betas=b, return_verts=True)
        if pose:
            kwargs.update(pose)
        if transl is not None:
            kwargs["transl"] = (
                torch.as_tensor(np.asarray(transl, dtype=np.float32)).reshape(1, 3).to(self.device)
            )
        out = self.model(**kwargs)
        return out.vertices[0]

    def rest_vertices(self, betas) -> torch.Tensor:
        return self.vertices(betas, pose=None, transl=None)

    # ---- parts -----------------------------------------------------------

    def part_indices(self, names) -> np.ndarray:
        if not self.segmentation:
            return np.zeros(0, dtype=np.int64)
        idx = []
        for n in names:
            idx.extend(self.segmentation.get(n, []))
        return np.unique(np.asarray(idx, dtype=np.int64))

    # ---- measurements (rest pose, numpy) ---------------------------------

    def circumference_at(self, verts: np.ndarray, y: float, idx: np.ndarray, band: float = 0.01) -> float:
        from scipy.spatial import ConvexHull

        sel = verts[idx]
        ring = sel[np.abs(sel[:, 1] - y) < band]
        if len(ring) < 8:
            return float("nan")
        pts = ring[:, [0, 2]]
        try:
            hull = ConvexHull(pts)
        except Exception:
            return float("nan")
        return float(hull.area)  # for 2D hulls, .area is the perimeter

    def waist_and_hip(self, rest_verts: np.ndarray) -> dict:
        """Waist = minimum torso circumference between hips and chest.
        Hip = maximum circumference in the hips region. Meters."""
        if not self.segmentation:
            return {"waist_m": float("nan"), "hip_m": float("nan")}
        torso = self.part_indices(TORSO_PARTS)
        hips = self.part_indices(("hips",))
        spine2 = self.part_indices(("spine2",))
        y_lo = float(np.percentile(rest_verts[hips, 1], 40))
        y_hi = float(np.percentile(rest_verts[spine2, 1], 60))
        ys = np.linspace(y_lo, y_hi, 40)
        circ = np.array([self.circumference_at(rest_verts, y, torso) for y in ys])
        ok = np.isfinite(circ)
        waist = float(np.nanmin(circ)) if ok.any() else float("nan")
        waist_y = float(ys[np.nanargmin(circ)]) if ok.any() else float("nan")

        y_h0 = float(rest_verts[hips, 1].min())
        y_h1 = float(np.percentile(rest_verts[hips, 1], 85))
        ys_h = np.linspace(y_h0, y_h1, 30)
        circ_h = np.array([self.circumference_at(rest_verts, y, hips) for y in ys_h])
        hip = float(np.nanmax(circ_h)) if np.isfinite(circ_h).any() else float("nan")
        return {"waist_m": waist, "waist_y": waist_y, "hip_m": hip}
