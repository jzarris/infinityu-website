"""Cheap capture checks that run before the body fit.

Two tiers:
  prefilter_image  needs only the decoded image size
  prefilter_mask   needs the person mask (about a second of CPU)
Both return refusal codes plus a message written for the person who took the photo.
A third tier, joint-based checks after the fit, lives in fit.capture_gates.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

RETAKE_INSTRUCTIONS = (
    "How to take the photo: prop your phone at hip height about 2.5 m (8 ft) away, "
    "use the timer, stand facing the camera with your whole body in frame from the top "
    "of your head to your feet with space above and below, arms slightly away from your "
    "sides, fitted clothing, plain background, good even light, and only you in the picture."
)

REASON_TEXT = {
    "no_person": "we could not find a person in the photo",
    "low_resolution": "the photo is too low resolution",
    "cut_off_top": "the top of your head is cut off",
    "cut_off_bottom": "your feet are cut off",
    "cut_off_side": "part of your body is outside the frame",
    "subject_too_small": "you are too far from the camera",
    "subject_too_large": "you are too close to the camera",
    "multiple_people": "more than one person is in the photo",
    "not_full_body": "your head or feet are not fully in the frame",
}


@dataclass
class PrefilterResult:
    ok: bool
    reasons: list[str] = field(default_factory=list)
    message: str = ""


def _message(reasons: list[str]) -> str:
    if not reasons:
        return ""
    problems = [REASON_TEXT.get(r.split(":")[0], r) for r in reasons]
    if len(problems) == 1:
        what = problems[0]
    else:
        what = ", ".join(problems[:-1]) + " and " + problems[-1]
    return f"We couldn't use this photo: {what}. Please take another one. {RETAKE_INSTRUCTIONS}"


def prefilter_image(orig_width: int, orig_height: int, min_short_side: int = 720) -> PrefilterResult:
    reasons = []
    if min(orig_width, orig_height) < min_short_side:
        reasons.append(f"low_resolution:{orig_width}x{orig_height}")
    return PrefilterResult(not reasons, reasons, _message(reasons))


def _edge_contact_frac(mask: np.ndarray, edge: str, band_px: int = 2) -> float:
    """Fraction of the person's width (or height, for sides) that touches the frame edge.

    A genuine crop leaves a flat cut along the edge and scores high. Toes or hair that
    merely come close to the edge, or a shadow touching it, score near zero.
    """
    H, W = mask.shape
    if edge == "top":
        band, extent = mask[:band_px, :].any(axis=0), mask.any(axis=0)
    elif edge == "bottom":
        band, extent = mask[H - band_px :, :].any(axis=0), mask.any(axis=0)
    elif edge == "left":
        band, extent = mask[:, :band_px].any(axis=1), mask.any(axis=1)
    else:
        band, extent = mask[:, W - band_px :].any(axis=1), mask.any(axis=1)
    n = int(extent.sum())
    return float(band.sum()) / n if n else 0.0


def prefilter_mask(
    mask: np.ndarray,
    min_coverage: float = 0.03,
    border_margin_frac: float = 0.02,  # kept for API compatibility; no longer a refusal
    min_height_frac: float = 0.45,
    max_height_frac: float = 0.985,
    secondary_component_frac: float = 0.15,
    crop_contact_frac: float = 0.25,
) -> PrefilterResult:
    """Checks on the person mask.

    Refuses only unambiguous problems: no person, the person cut by the frame edge
    across a wide span, too small in frame, or a second person. Being close to an
    edge is allowed here; the joint-based check after the fit decides whether the
    head and feet are actually inside the frame.
    """
    H, W = mask.shape
    reasons: list[str] = []
    coverage = float(mask.mean())
    if coverage < min_coverage:
        reasons.append(f"no_person:{coverage:.3f}")
        return PrefilterResult(False, reasons, _message(reasons))

    rows = np.where(mask.any(axis=1))[0]
    top, bottom = int(rows[0]), int(rows[-1])
    if _edge_contact_frac(mask, "top") > crop_contact_frac:
        reasons.append("cut_off_top")
    if _edge_contact_frac(mask, "bottom") > crop_contact_frac:
        reasons.append("cut_off_bottom")
    if (_edge_contact_frac(mask, "left") > crop_contact_frac
            or _edge_contact_frac(mask, "right") > crop_contact_frac):
        reasons.append("cut_off_side")

    height_frac = (bottom - top + 1) / H
    if height_frac < min_height_frac:
        reasons.append(f"subject_too_small:{height_frac:.2f}")
    elif height_frac > max_height_frac and not reasons:
        reasons.append(f"subject_too_large:{height_frac:.2f}")

    try:
        import cv2

        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
        if n > 2:
            areas = np.sort(stats[1:, cv2.CC_STAT_AREA])[::-1]
            if len(areas) > 1 and areas[1] > secondary_component_frac * areas[0]:
                reasons.append(f"multiple_people:{int(areas[1])}")
    except Exception:  # pragma: no cover
        pass

    return PrefilterResult(not reasons, reasons, _message(reasons))


def message_for(reasons: list[str]) -> str:
    return _message(reasons)
