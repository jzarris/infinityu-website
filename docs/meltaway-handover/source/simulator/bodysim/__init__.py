"""bodysim: prototype weight-loss body simulation pipeline.

Warps a person's own photo to a target weight by fitting a parametric body
model, re-solving its shape at the target weight under a fat/lean volume
constraint, and driving a dense 2D warp from the mesh delta.
"""

__version__ = "0.1.0"
