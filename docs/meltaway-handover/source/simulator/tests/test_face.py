import numpy as np

from bodysim.face import EYES, JAW, MOUTH, NOSE, face_displacements


def _synthetic_landmarks(cx=360.0, cy=200.0, w=120.0, h=160.0):
    """A schematic upright face: jaw arc, eyes, nose, mouth, brows."""
    lm = np.zeros((68, 2))
    t = np.linspace(np.pi, 2 * np.pi, 17)  # jaw from right-ear side, down around chin, to left
    lm[0:17, 0] = cx + (w / 2) * np.cos(t)
    lm[0:17, 1] = cy + (h / 2) * -np.sin(t) * 0.0 + np.linspace(cy - 20, cy - 20, 17)
    # make the jaw a U: y increases toward the chin (index 8)
    lm[0:17, 1] = cy - 20 + (h / 2 + 20) * np.abs(np.sin(t))
    lm[17:27] = np.column_stack([np.linspace(cx - 45, cx + 45, 10), np.full(10, cy - 60)])
    lm[27:36] = np.column_stack([np.full(9, cx), np.linspace(cy - 50, cy + 10, 9)])
    lm[36:42] = np.column_stack([np.linspace(cx - 45, cx - 15, 6), np.full(6, cy - 40)])
    lm[42:48] = np.column_stack([np.linspace(cx + 15, cx + 45, 6), np.full(6, cy - 40)])
    lm[48:68] = np.column_stack([cx + 25 * np.cos(np.linspace(0, 2 * np.pi, 20)),
                                 cy + 35 + 10 * np.sin(np.linspace(0, 2 * np.pi, 20))])
    return lm


def test_jaw_moves_inward_and_chin_up_features_fixed():
    lm = _synthetic_landmarks()
    pts, disp = face_displacements(lm, relative_loss=0.25, gain=0.6, lift_gain=0.35)
    jaw_pts, jaw_disp = pts[:17], disp[:17]
    cx = lm[EYES].mean(0)[0]
    # right-side jaw points move right (toward center), left-side move left
    assert np.all(jaw_disp[:6, 0] > 0)
    assert np.all(jaw_disp[11:, 0] < 0)
    # mid-jaw moves more than the ear points
    assert abs(jaw_disp[3, 0]) > abs(jaw_disp[0, 0]) * 2
    # chin lifts (negative y = up)
    assert jaw_disp[8, 1] < 0
    # anchors have zero displacement
    assert np.all(disp[17:] == 0)
    # magnitude sensible: 25% loss moves the mid-jaw by ~15% of half-width = ~9 px
    assert 5 < abs(jaw_disp[3, 0]) < 15


def test_zero_loss_is_identity():
    lm = _synthetic_landmarks()
    _, disp = face_displacements(lm, relative_loss=0.0)
    assert np.allclose(disp, 0)
