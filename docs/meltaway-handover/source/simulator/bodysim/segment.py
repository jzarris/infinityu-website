"""Person segmentation with the u2net_human_seg ONNX model run directly through
onnxruntime. Returns a boolean mask covering the person including clothing.

The preprocessing mirrors what the rembg project does for this model: resize to
320x320, scale by the image max, normalize with ImageNet mean/std, NCHW float32.
The output is min-max normalized and resized back to the source size.
"""

from __future__ import annotations

import numpy as np
from PIL import Image

_MEAN = (0.485, 0.456, 0.406)
_STD = (0.229, 0.224, 0.225)
_SIZE = (320, 320)
_sessions: dict[str, object] = {}


def _session(model_path: str):
    if model_path not in _sessions:
        import onnxruntime as ort

        opts = ort.SessionOptions()
        opts.log_severity_level = 3
        _sessions[model_path] = ort.InferenceSession(
            model_path, sess_options=opts, providers=["CPUExecutionProvider"]
        )
    return _sessions[model_path]


def person_mask(rgb: np.ndarray, model_path: str, threshold: int = 127) -> np.ndarray:
    im = Image.fromarray(rgb).convert("RGB")
    small = np.asarray(im.resize(_SIZE, Image.LANCZOS)).astype(np.float32)
    small = small / max(float(small.max()), 1e-6)
    x = np.empty((3, _SIZE[1], _SIZE[0]), dtype=np.float32)
    for c in range(3):
        x[c] = (small[:, :, c] - _MEAN[c]) / _STD[c]
    sess = _session(model_path)
    name = sess.get_inputs()[0].name
    out = sess.run(None, {name: x[None]})[0]
    pred = out[:, 0, :, :]
    pred = (pred - pred.min()) / max(float(pred.max() - pred.min()), 1e-6)
    pred = np.squeeze(pred)
    mask = Image.fromarray((pred * 255).astype(np.uint8), mode="L").resize(im.size, Image.LANCZOS)
    return np.asarray(mask) > threshold
