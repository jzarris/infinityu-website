"""Labels and contact sheets."""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw, ImageFont


_FONT_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
)


def _font(size: int):
    for path in _FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1 has only the tiny bitmap default
        return ImageFont.load_default()


def burn_label(rgb: np.ndarray, lines: list[str]) -> np.ndarray:
    """Dark band across the bottom with the given text lines. Legible at thumbnail size."""
    im = Image.fromarray(rgb).convert("RGB")
    W, H = im.size
    size = max(14, W // 40)
    font = _font(size)
    pad = size // 2
    band_h = pad * 2 + len(lines) * int(size * 1.3)
    draw = ImageDraw.Draw(im, "RGBA")
    draw.rectangle([0, H - band_h, W, H], fill=(0, 0, 0, 190))
    y = H - band_h + pad
    for line in lines:
        draw.text((pad, y), line, fill=(255, 255, 255, 255), font=font)
        y += int(size * 1.3)
    return np.asarray(im)


def title_bar(rgb: np.ndarray, title: str) -> np.ndarray:
    im = Image.fromarray(rgb).convert("RGB")
    W, H = im.size
    size = max(16, W // 30)
    bar = int(size * 1.8)
    canvas = Image.new("RGB", (W, H + bar), (20, 20, 20))
    canvas.paste(im, (0, bar))
    draw = ImageDraw.Draw(canvas)
    draw.text((size // 2, bar // 2 - size // 2), title, fill=(255, 255, 255), font=_font(size))
    return np.asarray(canvas)


def contact_sheet(panels: list[tuple[str, np.ndarray]], gap: int = 12) -> np.ndarray:
    tiles = [title_bar(img, t) for t, img in panels]
    H = max(t.shape[0] for t in tiles)
    W = sum(t.shape[1] for t in tiles) + gap * (len(tiles) - 1)
    sheet = np.full((H, W, 3), 20, dtype=np.uint8)
    x = 0
    for t in tiles:
        sheet[: t.shape[0], x : x + t.shape[1]] = t
        x += t.shape[1] + gap
    return sheet
