from bodysim.config import SimConfig, SubjectParams
from bodysim.physiology import bmi, check_target, partition_loss, volume_change_liters


def test_bmi():
    assert abs(bmi(70, 175) - 22.86) < 0.01


def test_partition_and_volume():
    cfg = SimConfig()
    fat, lean = partition_loss(10, 0.75)
    assert fat == 7.5 and lean == 2.5
    dv = volume_change_liters(10, 0.75, cfg)
    # 7.5/0.90 + 2.5/1.10
    assert abs(dv - (7.5 / 0.9 + 2.5 / 1.1)) < 1e-9
    # more fat -> more volume per kg
    assert volume_change_liters(10, 0.85, cfg) > volume_change_liters(10, 0.65, cfg)


def test_imperial_params_convert_and_display():
    p = SubjectParams.from_imperial(height_in=60, weight_lb=150, target_lb=110, sex="female", age=47)
    assert abs(p.height_cm - 152.4) < 1e-6
    assert abs(p.weight_kg - 68.04) < 0.01
    assert abs(p.delta_kg - 18.14) < 0.01
    assert p.fmt_delta() == "-40 lb"
    assert p.fmt_height() == "5'0\""
    assert p.fmt_weight(p.target_weight_kg) == "110 lb"
    assert p.fmt_length(2.54) == "1.0 in"
    d = p.to_dict()
    assert d["units"] == "imperial" and d["display"]["loss"] == "-40 lb"
    m = SubjectParams(152.4, 68, 50)
    assert m.fmt_delta() == "-18 kg" and m.fmt_height() == "152 cm" and m.fmt_length(12.5) == "12.5 cm"


def test_check_target_accepts_reasonable():
    cfg = SimConfig()
    p = SubjectParams(height_cm=170, weight_kg=95, target_weight_kg=80)
    assert check_target(p, cfg) == []


def test_check_target_refuses_bmi_floor_and_gain():
    cfg = SimConfig()
    assert "target_bmi_below_healthy_floor" in check_target(
        SubjectParams(height_cm=170, weight_kg=60, target_weight_kg=50), cfg
    )
    assert "target_not_below_current_weight" in check_target(
        SubjectParams(height_cm=170, weight_kg=80, target_weight_kg=85), cfg
    )
    assert "loss_exceeds_max_fraction" in check_target(
        SubjectParams(height_cm=170, weight_kg=150, target_weight_kg=90), cfg
    )
