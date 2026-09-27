# Body simulator prototype

Standalone prototype that warps a person's own full-body photo to show them at a
target weight. It exists to answer one question: does the result look plausible
enough to be worth showing to customers. It is not wired to the web app, stores
nothing on a server, and should only be run on photos of people who agreed to be
test subjects.

## How it works

1. Segment the person from the background.
2. Fit a parametric body model (SMPL-X, via the NLF estimator) to the photo. This
   gives shape parameters, pose, and a camera-space mesh.
3. Scale the mesh to the stated height and compute its volume. Report the implied
   weight against the stated weight as a plausibility check.
4. For each of three variants (conservative / expected / optimistic fat share of
   the loss), convert the kilograms lost into liters using fat and lean tissue
   densities, then solve for the smallest change in shape parameters that hits
   the target volume while preserving height. The shape basis is anthropometric,
   so the change redistributes non-uniformly on its own.
5. Project the original and target meshes through the camera, build a dense
   displacement field from front-facing vertices, warp the photo, and inpaint the
   background revealed where the silhouette shrank. Hands and feet are held
   still; the head gets a reduced displacement.
6. Burn a simulation label and a typical-results line into each output, write a
   contact sheet, and write `record.json` with every parameter, measurement,
   and stage timing.

Nothing about the person is synthesized. The output is their own pixels moved.

## Setup

Requires a Modal account for the GPU side and Python 3.12 locally.

```bash
cd simulator
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
modal setup                      # one-time browser login
modal run modal_app.py::download_models
```

The SMPL-X body model is licensed for non-commercial research and must be
downloaded manually. Register at https://smpl-x.is.tue.mpg.de, download the
npz models, then:

```bash
modal volume put bodysim-models /path/to/SMPLX_NEUTRAL.npz /smplx/SMPLX_NEUTRAL.npz
```

Confirm the commercial license position before this goes anywhere near a product.
The NLF model weights are also released for non-commercial research use.

## Run

```bash
modal run modal_app.py --photo samples/me.jpg --height-cm 170 --weight-kg 95 --target-kg 80 --sex female --age 42
# or in pounds and inches; labels, titles and the printed summary then use those units
modal run modal_app.py --photo samples/me.jpg --height-in 67 --weight-lb 210 --target-lb 176 --sex female --age 42
```

Give one full set of units, not a mix. Internally everything is metric;
`record.json` carries both (`params` in metric, `params.display` as entered).

Outputs land in `out/<photo-stem>/`: `original.png`, one PNG per variant,
`contact_sheet.png`, and `record.json`.

Optional `--typical-results "Typical results: X kg over Y weeks"` replaces the
placeholder label. That figure must be substantiated before any customer sees it.

## Pre-filter

Photos are checked before the expensive fit and refused with a message written
for the person who took them (`record.user_message`), which restates how to take
the picture. Checks, in order of cost:

1. Original resolution: short side under 720 px is refused.
2. Person mask (about a second): no person, the person cut by the top, bottom,
   or side edge across more than a quarter of their width (a flat cut, as
   opposed to toes or hair merely close to the edge), subject filling less than
   45% of the frame height, or a second large connected region (another person).
3. After the fit: head or feet joints projecting outside the frame. This is the
   check that decides borderline cases the mask check lets through.

Softer problems (multiple small detections, implied weight far from stated, no
face found) stay as warnings and still produce images.

## Facial pass

The body model's shape components barely affect the face, so the face is handled
separately. A 68-point landmark detector locates the jaw, and the jaw and cheek
contour is moved toward the face midline, with a small upward lift under the
chin, scaled by the relative weight loss. Eyes, nose, mouth, and brows are
anchored. `face_gain` (default 0.8) and `face_lift_gain` (0.45) control the
strength; on the first test subject 0.6 read as timid and 1.0 as plausible for a
26% loss, so the default sits between. The plan's rule is to err small. If no face is found the head falls
back to a damped copy of the mesh delta and a `face_not_detected` warning is
recorded.

## Reading record.json

- `refusals`: non-empty means no images were produced. `user_message` carries the
  text to show. Reasons include the pre-filter codes above, a target BMI below
  18.5, a loss above 35% of body weight, or no person detected.
- `warnings`: `multiple_people_detected`, `implied_weight_far_from_stated`
  (the mesh volume disagrees with the stated weight by more than 30%), or
  `projection_mismatch`.
- `measure.implied_over_stated`: near 1.0 means the fit is consistent with the
  stated weight. Loose clothing pushes this above 1.
- `variants.<name>.waist_cm_per_kg`: sanity check against the roughly 1 cm per
  kg relationship seen in weight-loss studies.
- `timings_s`: per-stage wall time on the GPU host. Multiply the total by the
  hourly GPU rate to get cost per image.

## Iterating locally without a GPU

Every Modal run also writes `fit_debug.npz` (the fitted mesh, camera, and person
mask). With the SMPL-X model copied into `simulator/models/smplx/` and the
segmentation file in `simulator/models/`, the solve, warp, and inpaint stages can
be rerun on CPU in seconds:

```bash
python scripts/rewarp.py out/minta1 --height-cm 152.4 --weight-kg 68 --target-kg 50 --sex female --age 47
python scripts/rewarp.py out/minta1 ... --set face_coefficient=0.25 --set solver_reg_weights=1,0.33,1,1,1,1,1,1,1,1
```

Output goes to `out/<run>/rewarp/`. Inpainting falls back to OpenCV locally, so
judge the warp geometry there and the fill quality on the GPU output.

The shape solver is a minimum-norm Gauss-Newton solve on two constraints
(target volume, unchanged height). With uniform weights it gives about 0.85 cm
of waist per kg on the test subject, against the roughly 1 cm per kg seen in
weight-loss studies. `solver_reg_weights` makes individual shape components
cheaper to move; lowering the second component pushes more of the change to the
trunk. Treat that as a calibration knob for later, not something to tune by eye.

## Site integration (web endpoints)

`modal_app.py` also exposes two web endpoints the Next.js site calls, protected
by a bearer token from the Modal secret `bodysim-api`:

- `POST submit` with `{image_b64, params, overrides}` starts a run and returns
  `{call_id}`.
- `GET result?id=` returns `{status: pending}`, `{status: done, record, images}`
  with images base64-encoded, or `{status: failed, error}`.

The service is stateless. Deploy with `modal deploy modal_app.py`; the full
procedure is in `docs/SIMULATOR_V1_RUNBOOK.md`.

## Tests

CPU-only tests cover the physiology, camera, and warp math:

```bash
pytest tests
```

## Known limits of this prototype

- Front view only. Abdominal depth is underestimated without a profile view.
- Loose clothing is not detected; it inflates the fitted volume and the warp
  follows the garment, not the body.
- No dedicated face model. The head is displaced at a fraction of the body
  displacement, which is a crude stand-in for facial change.
- The "two independent estimates" check from the plan is not implemented. The
  volume constraint is the only shape driver; the implied-weight ratio and the
  waist-per-kg figure are the plausibility checks.
- Hands and feet are pinned; the transition at wrists and ankles is only as
  smooth as the field blur.
- Runs on one GPU with no queue. Cold start adds model loading time to the
  first request.
