from bodysim.pipeline import STAGE_START, Timer, stage_progress


def test_stage_fractions_are_monotonic_and_labeled():
    fractions = [f for _, f, _ in STAGE_START]
    assert fractions == sorted(fractions)
    assert all(0.0 <= f < 1.0 for f in fractions)
    assert all(label for _, _, label in STAGE_START)


def test_variant_stages_match_by_prefix():
    assert stage_progress("solve_expected") == stage_progress("solve_conservative")
    assert stage_progress("inpaint_expected")[0] > stage_progress("warp_expected")[0]
    assert stage_progress("unknown_stage") == (0.0, "Working")


def test_timer_reports_stage_starts_and_survives_callback_errors():
    seen = []

    def on_stage(name, fraction, label):
        seen.append((name, fraction, label))
        raise RuntimeError("reporting broke")

    t = Timer(on_stage)
    with t.stage("fit"):
        pass
    assert seen == [("fit", 0.20, "Fitting your body model")]
    assert "fit" in t.stages
