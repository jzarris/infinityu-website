"""Landmark-driven facial pass.

The body model's shape components barely touch the face, so the mesh delta is a
poor guide there. Instead, detect 68 face landmarks in the image and move the
jaw and cheek contour inward toward the face midline, and the chin/submental
points slightly upward, scaled by the relative weight change. Eyes, nose, mouth,
and brows are anchored so features do not drift.

Returns 2D point/displacement pairs that are merged into the dense warp field.
"""

from __future__ import annotations

import numpy as np

# 68-point (iBUG) indices
JAW = list(range(0, 17))  # 0 = right ear side, 8 = chin, 16 = left ear side
BROWS = list(range(17, 27))
NOSE = list(range(27, 36))
EYES = list(range(36, 48))
MOUTH = list(range(48, 68))

# How much each jaw point moves toward the midline, relative to the maximum.
# Small near the ears (bone), largest along the mid-jaw and cheeks (soft tissue),
# moderate at the chin.
JAW_PROFILE = np.array(
    [0.25, 0.55, 0.85, 1.0, 1.0, 0.95, 0.8, 0.65, 0.5, 0.65, 0.8, 0.95, 1.0, 1.0, 0.85, 0.55, 0.25]
)
# Upward (submental) lift profile: chin and the two points either side.
LIFT_PROFILE = np.zeros(17)
LIFT_PROFILE[6:11] = [0.3, 0.7, 1.0, 0.7, 0.3]

_detector = None


def detect_landmarks(rgb: np.ndarray, device: str = "cpu"):
    """Returns the (68,2) landmarks of the largest face, or None."""
    global _detector
    try:
        import face_alignment
    except ImportError:
        return None
    if _detector is None:
        lt = getattr(face_alignment.LandmarksType, "TWO_D", None) or getattr(face_alignment.LandmarksType, "_2D")
        _detector = face_alignment.FaceAlignment(lt, device=device, flip_input=False)
    preds = _detector.get_landmarks_from_image(np.ascontiguousarray(rgb))
    if not preds:
        return None
    if len(preds) > 1:
        preds = sorted(preds, key=lambda p: -np.ptp(p[:, 0]) * np.ptp(p[:, 1]))
    return np.asarray(preds[0], dtype=np.float64)[:, :2]


def face_displacements(
    lm: np.ndarray, relative_loss: float, gain: float = 0.6, lift_gain: float = 0.35
) -> tuple[np.ndarray, np.ndarray]:
    """Compute (points (M,2), displacement (M,2)) for the face.

    relative_loss = kg lost / starting kg. gain scales inward jaw movement as a
    fraction of each point's distance from the face midline. lift_gain scales the
    upward chin movement as a fraction of the chin-to-mouth distance.
    """
    eyes_c = lm[EYES].mean(axis=0)
    chin = lm[8]
    axis = chin - eyes_c
    axis_len = np.linalg.norm(axis) + 1e-9
    u = axis / axis_len  # down the face
    n = np.array([-u[1], u[0]])  # across the face

    pts = lm[JAW]
    rel = pts - eyes_c
    across = rel @ n  # signed distance from the midline
    inward = -across * (gain * relative_loss) * JAW_PROFILE
    disp = np.outer(inward, n)

    mouth_bottom = lm[57]
    submental = np.linalg.norm(chin - mouth_bottom)
    lift = -u * (lift_gain * relative_loss * submental)
    disp += np.outer(LIFT_PROFILE, lift)

    anchors = lm[BROWS + NOSE + EYES + MOUTH]
    points = np.vstack([pts, anchors])
    disps = np.vstack([disp, np.zeros_like(anchors)])
    return points, disps
