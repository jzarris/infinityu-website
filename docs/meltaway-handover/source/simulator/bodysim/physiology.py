"""Pure-python physiology: BMI, fat/lean partition, volume change, refusal checks."""

from __future__ import annotations

from .config import SimConfig, SubjectParams


def bmi(weight_kg: float, height_cm: float) -> float:
    h = height_cm / 100.0
    return weight_kg / (h * h)


def partition_loss(delta_kg: float, fat_fraction: float) -> tuple[float, float]:
    """Split a mass change into (fat_kg, lean_kg)."""
    fat = delta_kg * fat_fraction
    lean = delta_kg - fat
    return fat, lean


def volume_change_liters(delta_kg: float, fat_fraction: float, cfg: SimConfig) -> float:
    """Volume lost, in liters, for a mass loss of delta_kg with the given fat share.

    dV = m_fat / rho_fat + m_lean / rho_lean
    """
    fat, lean = partition_loss(delta_kg, fat_fraction)
    return fat / cfg.fat_density_kg_per_l + lean / cfg.lean_density_kg_per_l


def implied_weight_kg(volume_liters: float, cfg: SimConfig) -> float:
    return volume_liters * cfg.body_density_kg_per_l


def check_target(params: SubjectParams, cfg: SimConfig) -> list[str]:
    """Return refusal reasons. Empty list means the target is acceptable."""
    reasons: list[str] = []
    if params.height_cm < 120 or params.height_cm > 230:
        reasons.append("height_out_of_range")
    if params.weight_kg < 30 or params.weight_kg > 350:
        reasons.append("weight_out_of_range")
    if params.delta_kg <= 0:
        reasons.append("target_not_below_current_weight")
    else:
        if params.delta_kg > cfg.max_loss_fraction * params.weight_kg:
            reasons.append("loss_exceeds_max_fraction")
        if bmi(params.target_weight_kg, params.height_cm) < cfg.min_target_bmi:
            reasons.append("target_bmi_below_healthy_floor")
    if params.sex not in ("female", "male", "other"):
        reasons.append("sex_not_recognized")
    if params.age < 18 or params.age > 100:
        reasons.append("age_out_of_range")
    return reasons
