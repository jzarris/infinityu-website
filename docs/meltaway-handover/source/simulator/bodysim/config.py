from __future__ import annotations

from dataclasses import asdict, dataclass, field


LB_PER_KG = 2.2046226218
CM_PER_IN = 2.54


@dataclass(frozen=True)
class SubjectParams:
    """What the person tells us. Nothing here is derived from the photo.

    Stored in metric. `units` records what the person entered ('metric' or
    'imperial') so every label and summary is shown back in the same units.
    """

    height_cm: float
    weight_kg: float
    target_weight_kg: float
    sex: str = "female"  # 'female' | 'male' | 'other'
    age: int = 40
    units: str = "metric"

    @classmethod
    def from_imperial(cls, height_in: float, weight_lb: float, target_lb: float,
                      sex: str = "female", age: int = 40) -> "SubjectParams":
        return cls(
            height_cm=height_in * CM_PER_IN,
            weight_kg=weight_lb / LB_PER_KG,
            target_weight_kg=target_lb / LB_PER_KG,
            sex=sex, age=age, units="imperial",
        )

    @property
    def delta_kg(self) -> float:
        return self.weight_kg - self.target_weight_kg

    # ---- display in the units the person entered ----

    @property
    def imperial(self) -> bool:
        return self.units == "imperial"

    def fmt_weight(self, kg: float) -> str:
        return f"{kg * LB_PER_KG:.0f} lb" if self.imperial else f"{kg:.0f} kg"

    def fmt_delta(self) -> str:
        return "-" + self.fmt_weight(self.delta_kg)

    def fmt_height(self) -> str:
        if self.imperial:
            total = self.height_cm / CM_PER_IN
            ft, inch = divmod(int(round(total)), 12)
            return f"{ft}'{inch}\""
        return f"{self.height_cm:.0f} cm"

    def fmt_length(self, cm: float) -> str:
        return f"{cm / CM_PER_IN:.1f} in" if self.imperial else f"{cm:.1f} cm"

    def to_dict(self) -> dict:
        d = asdict(self)
        d["display"] = {
            "height": self.fmt_height(),
            "weight": self.fmt_weight(self.weight_kg),
            "target_weight": self.fmt_weight(self.target_weight_kg),
            "loss": self.fmt_delta(),
        }
        return d


@dataclass(frozen=True)
class VariantSpec:
    """One rendered outcome. fat_fraction is the share of lost mass that is fat.

    Higher fat fraction means more volume lost per kg (fat is less dense than
    lean tissue), so 'optimistic' is the most visible change.
    """

    name: str
    fat_fraction: float
    # Optional per-component solver weights for this variant (None = config default).
    # Lower weight on the second component concentrates the change on the trunk.
    reg_weights: tuple[float, ...] | None = None


DEFAULT_VARIANTS: tuple[VariantSpec, ...] = (
    VariantSpec("conservative", 0.65),
    VariantSpec("expected", 0.75),
    VariantSpec("optimistic", 0.85),
)

# Alternative set where the variants differ in *where* the weight comes off, which is
# the larger real-world uncertainty. Enable with cfg.variants = DISTRIBUTION_VARIANTS.
DISTRIBUTION_VARIANTS: tuple[VariantSpec, ...] = (
    VariantSpec("even", 0.75, None),
    VariantSpec("expected", 0.75, (1, 0.33, 1, 1, 1, 1, 1, 1, 1, 1)),
    VariantSpec("trunk", 0.75, (1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1)),
)


@dataclass
class SimConfig:
    # Image handling
    work_max_side: int = 1280
    fov_degrees: float = 55.0

    # Physiology
    fat_density_kg_per_l: float = 0.90
    lean_density_kg_per_l: float = 1.10
    body_density_kg_per_l: float = 1.02  # used only for the implied-weight diagnostic
    min_target_bmi: float = 18.5
    max_loss_fraction: float = 0.35  # refuse a target below 65% of current weight

    # Fitting
    fit_beta_regularizer: float = 0.5  # model default is 10, which pulls every body toward average
    fit_num_aug: int = 3  # test-time augmentation passes; more is slower and steadier

    # Fit plausibility and capture gates (warnings in the prototype, refusals later)
    implied_weight_tolerance: float = 0.30  # warn if |implied/stated - 1| exceeds this
    max_people: int = 1
    min_subject_height_px: int = 700  # subject bounding box shorter than this is too small to trust
    full_body_margin_px: int = 4  # head and both feet must project inside the frame by this margin

    # Shape solver (minimum-norm Gauss-Newton; converges in a handful of iterations)
    solver_iters: int = 30
    solver_tol: float = 1e-3  # stop when both relative errors are below this
    # Per-component regularization weights. Lower = cheaper to move. None = all equal.
    # The second shape component of SMPL-X is the girth/weight direction.
    solver_reg_weights: tuple[float, ...] | None = None

    # Warp
    face_coefficient: float = 0.35  # head displacement scale when no face landmarks are found
    face_gain: float = 0.8  # landmark pass: jaw/cheek inward movement per unit relative loss
    face_lift_gain: float = 0.45  # landmark pass: chin/submental upward movement
    face_landmarks: bool = True

    # Pre-filter (refusals with a retake message; run before the fit)
    prefilter_min_short_side: int = 720
    prefilter_border_margin_frac: float = 0.02
    prefilter_min_height_frac: float = 0.45
    scale_smooth_iters: int = 40  # mesh-graph smoothing of the per-vertex displacement scale
    hand_contact_m: float = 0.06  # hands closer than this to the body move with that surface
    feather_frac: float = 0.025  # displacement bleed outside the old silhouette, as a fraction of the long side
    field_blur_sigma: float = 3.0
    field_downsample: int = 4
    inpaint_dilate_px: int = 3

    # Output
    typical_results_text: str = "Typical results: NOT YET SUBSTANTIATED (placeholder)"
    simulation_label: str = "SIMULATION - not a photograph of results"

    # Models
    nlf_model_file: str = "nlf/nlf_l_multi_0.3.2.torchscript"
    body_model_type: str = "smplx"
    body_model_gender: str = "neutral"
    num_betas: int = 10
    segmentation_file: str = "smplx_vert_segmentation.json"
    person_seg_model: str = "u2net/u2net_human_seg.onnx"

    variants: tuple[VariantSpec, ...] = field(default_factory=lambda: DEFAULT_VARIANTS)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["variants"] = [asdict(v) for v in self.variants]
        return d
