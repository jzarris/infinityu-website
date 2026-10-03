import numpy as np

from bodysim.prefilter import prefilter_image, prefilter_mask


def _person(H, W, top, bottom, left, right):
    m = np.zeros((H, W), bool)
    m[top:bottom, left:right] = True
    return m


def test_good_photo_passes():
    m = _person(1280, 720, 80, 1200, 200, 520)
    r = prefilter_mask(m)
    assert r.ok, r.reasons


def test_feet_cut_off_is_refused_with_retake_message():
    m = _person(1280, 720, 80, 1280, 200, 520)  # flat cut along the bottom edge
    r = prefilter_mask(m)
    assert not r.ok and "cut_off_bottom" in r.reasons
    assert "feet are cut off" in r.message and "2.5 m" in r.message


def test_head_cut_off():
    m = _person(1280, 720, 0, 1200, 200, 520)
    r = prefilter_mask(m)
    assert "cut_off_top" in r.reasons


def test_feet_close_to_edge_but_visible_passes():
    # whole person visible, toes 1% from the bottom: must not be called cut off
    m = _person(1280, 720, 80, 1268, 200, 520)
    assert prefilter_mask(m).ok


def test_narrow_edge_contact_like_a_shadow_passes():
    m = _person(1280, 720, 80, 1240, 200, 520)
    m[1240:1280, 340:372] = True  # a thin strip touching the bottom edge
    assert prefilter_mask(m).ok


def test_too_small_and_no_person():
    small = _person(1280, 720, 500, 900, 300, 420)
    assert "subject_too_small" in prefilter_mask(small).reasons[0]
    empty = np.zeros((1280, 720), bool)
    assert prefilter_mask(empty).reasons[0].startswith("no_person")


def test_two_people():
    m = _person(1280, 720, 80, 1200, 100, 300) | _person(1280, 720, 80, 1200, 420, 620)
    r = prefilter_mask(m)
    assert any(x.startswith("multiple_people") for x in r.reasons)


def test_low_resolution():
    assert not prefilter_image(320, 400).ok
    assert prefilter_image(2268, 4032).ok
