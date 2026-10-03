# Body Simulator V1: Site Integration Plan

2026-09-20. Supersedes the Phase 2 and Phase 3 storage assumptions in
`docs/weightloss_simulation.md` where they conflict. Findings come from the
prototype under `simulator/` and the PHI survey in `docs/PHI_READINESS_SURVEY.md`.

## Implementation status (branch `simulator-v1`, 2026-09-20)

Built and type-checked, not yet deployed or run against a database:

| Item | Status | Where |
|---|---|---|
| R-1 tracking scoped to marketing routes | done, tested | `src/lib/tracking-scope.ts`, `src/components/tracking/TrackingScripts.tsx` |
| R-2 custom script injection removed | done | tracking routes and admin page; stored keys stripped on save |
| R-3 health data out of logs | done, static guard test | `src/lib/log.ts`, `src/lib/no-pii-logging.test.ts`; intake, Zoho, support, contact, chat sites |
| R-6 durable OTP limits | done | `src/lib/rate-limit-db.ts`; verify-code, send-code, patient-login/verify, forgot-password/verify |
| R-11 role checks centralized | done | `src/lib/authz.ts`; 60 inline checks replaced; portal layout checks role |
| V-1 encrypted volume store behind an interface | done, tested | `src/lib/photo-store.ts`, `src/lib/photo-crypto.ts` |
| V-2 schema and migration | done | `prisma/migrations/20260920120000_simulator_v1` |
| V-3 owner-scoping helper | done, tested | `src/lib/authz.ts`, `src/lib/authz-core.ts` |
| V-4 pre-signup access cookie | done, tested | `src/lib/sim-access.ts`, set in `/api/intake` |
| V-5 consent capture | done | `src/lib/consent-text.ts`, `/api/simulate/consent` |
| V-6 capture page with units toggle | done | `src/app/simulate`, `src/components/simulator` |
| V-7 Modal bridge, POST-only images | done | `simulator/modal_app.py` endpoints, `src/lib/simulator-client.ts`, `/api/simulate/*` |
| V-8 delete, retention, kill switch | done | `/api/simulate/delete`, `/api/cron/retention`, admin settings |
| V-9 admin view, diagnostics, re-run | done | `/admin/simulator`, `/api/admin/simulations/*` |
| V-10 launch checks | not started | needs a deployed environment |

Not done, by design: B-1 licensing, B-2 typical-results figure, B-3 is
implemented as the recommendation (one image at a capped goal) and can be
changed via config. Deployment steps are in `docs/SIMULATOR_V1_RUNBOOK.md`.
Runtime behavior against Postgres and Modal has not been exercised yet; the
first deploy to a staging environment is the next step.

## What V1 is

A person who has completed intake phone verification, or a logged-in patient,
takes or uploads one full-body photo, enters a goal weight, and within about a
minute sees their own photo warped to that weight with a burned-in disclosure.
The photo and outputs are stored encrypted for a limited time and can be
deleted by the person. Nothing else: no follow-up matching, no calibration,
no guided live capture, no training use of photos.

## Decisions already made

- Runs pre-signup after phone verification and post-login. Pre-signup drives the
  requirements (advertising rules, consent for non-patients, shorter retention).
- Photo storage in V1 is the Railway volume, encrypted at the application layer,
  behind a storage interface. A bucket comes later only if a second service
  needs shared access.
- Vendor agreements are handled outside engineering.

## What the prototype changed

- **The GPU host is Modal, and it is stateless.** Photo bytes are sent with the
  request and results come back in the response. Modal keeps nothing between
  calls. That means V1 needs no shared bucket and no worker service: the
  Next.js app calls Modal, waits, and stores the result on the volume. The
  worker and bucket from the original Phase 2 are deferred.
- **Cost is about 2 cents per image** on an A10 when the container is warm.
  Cold start adds roughly a minute of wall time the first user after idle pays.
- **The pre-filter runs on the GPU host** (segmentation, 2 s) before the fit.
  A bad photo is refused in a few seconds with a retake message.
- **Inputs already exist.** Intake collects height in feet and inches, weight in
  pounds, sex, and date of birth. The simulator needs only a goal weight added.
- **Units.** The pipeline accepts either metric or imperial and returns labels
  in the units entered. The site defaults to imperial and lets the patient
  switch to metric (V-6).

## Blockers that must be resolved before any customer sees this

### B-1 Model licensing

SMPL-X (the body model) and the NLF fitter weights are both licensed for
non-commercial research only. The prototype is fine under those terms. A
customer-facing feature is not. Options, in order of preference:

1. Commercial SMPL-X license from Meshcapade, and confirm the NLF terms with
   its author (same research group). Ask for both together.
2. If NLF cannot be licensed, replace the fitter. Candidates with permissive
   terms exist but each is a week of integration and re-tuning.
3. If SMPL-X cannot be licensed, the approach changes fundamentally. Stop and
   re-plan.

Start this conversation now. It is the longest pole and nothing below depends
on its outcome except launch.

### B-2 Typical-results figure

The disclosure burned into every image currently says "NOT YET SUBSTANTIATED".
V1 needs a real figure with a documented source before launch. If MeltAwayMD
has no outcome data yet, use published clinical outcomes for the specific
program and cite them in config. This is a business input, not code.

### B-3 What the images represent (decision needed)

The prototype's three variants are visually identical for a fixed goal weight.
Recommendation for V1: **show one image**, at the person's goal weight capped
at the program's documented typical outcome, with the typical-results figure in
the label. Drop the three-variant contact sheet from the customer-facing
output. The range concept can return in V2 as percentile outcomes once there is
data to define them. If you prefer three images anyway, they should be
percentile outcomes, not fat-share variants.

## Prerequisite remediation (from Phase 1, must ship before V1)

These are unchanged from the existing plan. V1 cannot launch with any of them
open, because the simulator pages would inherit the exposure.

| ID | What | Why it gates V1 |
|---|---|---|
| R-1 | No tracking scripts on `/portal`, `/admin`, and the new `/simulate` routes | Photo pages must load no third-party script |
| R-2 | Remove or allowlist the custom script fields | Same |
| R-3 | Stop logging health data to stdout | The new routes handle photos and weights; logging discipline must exist first |
| R-6 | Rate-limit OTP verification, backed by Postgres | Phone verification is the only gate on the pre-signup path |
| R-11 | Role-check the portal layout, centralize the admin check | The simulator's authorization helper builds on it |

R-4, R-5, R-7 through R-10 should follow but do not block V1. R-7 (separate
encryption key) is partially addressed below because V1 introduces its own key.

## V1 tickets

Each ticket: Problem, Work, Done when.

### V-1 Storage interface and encrypted volume store

**Problem.** No place to put a photo. The two existing upload paths write to
`public/` or a Postgres bytes column served publicly.

**Work.** One module, `src/lib/photo-store.ts`, with `put(bytes) -> key`,
`get(key) -> bytes`, `delete(key)`. The V1 backend writes to
`data/photos/<key>` on the Railway volume, encrypted with AES-256-GCM under a
new `PHOTO_ENCRYPTION_KEY` env var (32 bytes, base64), never `NEXTAUTH_SECRET`.
Keys are random UUIDs. Nothing outside this module touches the filesystem for
photos. Confirm the Railway volume is mounted at `/app/data` and has headroom:
budget about 3 MB per photo plus 1 MB per output.

**Done when.** A photo written through the interface is unreadable on disk
without the key; a Postgres dump plus the repo contains nothing that decrypts
it; swapping the backend to a bucket later touches only this file.

### V-2 Data model and migration

**Problem.** No schema for photos, consent, or simulations.

**Work.** Prisma models:

- `PhotoConsent`: id, userId, version, textShown (full text), purposes (json),
  ipAddress, userAgent, createdAt, withdrawnAt.
- `BodyPhoto`: id, userId, consentId, storageKey, sha256, width, height,
  capturedAt, retentionAt, deletedAt, status (accepted / refused), refusalReasons.
  Refused photos are kept too, on a short clock (7 days), so an admin can see
  what the person sent when they report that a good photo was rejected.
- `Simulation`: id, photoId, userId, cohort (pre_signup / post_login),
  units (metric / imperial), paramsMetric (json), paramsDisplay (json),
  goalWeightKgRequested, goalWeightKgApplied (after cap), outputKeys (json),
  diagnostics (json: the prototype's full record, including fit uncertainty,
  implied-versus-stated weight, waist figures, gate and pre-filter outcomes,
  inpainter used, stage timings, and config values), modelVersion, createdAt.

Retention date set at write: 30 days for a user with no Asher order, 365 days
otherwise (tune once policy is written). No photo bytes in Postgres. Do not put
measurements into `AuditLog.details`.

**Done when.** Migration applies and rolls back; every `BodyPhoto` has a
non-null consent and retention date.

### V-3 Owner-scoping helper

**Problem.** No pattern for a patient reading their own record.

**Work.** `src/lib/authz.ts` with `requireOwnedRecord(session, model, id)`:
patient gets own record, admin gets any, otherwise throws. Every simulator
route uses it. Retrofit `/api/support` as the first existing caller. Structure
for a future staff role without rework.

**Done when.** A patient requesting another patient's simulation is refused;
covered by tests for patient, admin, other-patient, and no-session.

### V-4 Pre-signup access

**Problem.** Intake phone verification creates a `User` but no session. The
simulator needs to know who the person is without putting a token in a URL.

**Work.** When `/api/intake` succeeds, set an httpOnly, secure, sameSite=lax
cookie `sim_access` containing a signed JWT bound to the new user id, 30-minute
lifetime, purpose `simulator`. `/simulate` and `/api/simulate` accept either a
normal patient session or a valid `sim_access` cookie. The intake success
screen gains a "See what your goal could look like" button linking to
`/simulate`. Post-login, the portal gets a "Simulator" entry linking to the same
page.

**Done when.** The page is unreachable without one of the two credentials; the
cookie cannot be used for anything but the simulator routes; no identifier
appears in any URL.

### V-5 Consent capture

**Problem.** The only consent in the codebase is the SMS checkbox.

**Work.** Before the camera opens, a consent screen with versioned text
covering: what the photo is used for (producing the simulation for you), where
it is stored and for how long, that it is a simulation and not a prediction,
how to delete it, and that it is not used for anything else. One checkbox. The
exact text and version are stored in `PhotoConsent`. No training opt-in in
V1 because V1 does no training. Draft the text with whoever handles the
privacy policy; the policy itself must mention photos before launch.

**Done when.** No `BodyPhoto` row can exist without a current consent; the
stored text matches what was rendered, verified by test.

### V-6 Capture page

**Problem.** Nothing exists.

**Work.** `/simulate` as a client page with no third-party scripts:

1. Instructions with the retake checklist from the pipeline (phone at hip
   height, 2.5 m away, head to feet, fitted clothing, plain background, only
   you). Show a simple silhouette illustration.
2. Inputs with a units toggle, imperial by default: height (feet and inches, or
   centimeters), current weight (pounds or kilograms), and goal weight in the
   same units. Height and current weight are pre-filled from intake or the
   patient record and editable. Switching the toggle converts the values shown
   without losing what was typed. The chosen units are sent with the request,
   stored on the simulation, and used for every label and the result screen.
   Client-side check that the goal is below current weight and above the BMI
   floor, mirroring the server.
3. `<input type="file" accept="image/*" capture="environment">` so phones open
   the camera; desktop gets a file picker. Client-side: read EXIF orientation,
   downscale to 1600 px long side, re-encode as JPEG, and strip metadata before
   upload. This keeps uploads small and removes GPS from the photo before it
   leaves the device.
4. Upload, then a progress screen honest about the wait ("about a minute, longer
   the first time"). Poll for the result.
5. Result screen: original and simulation side by side, the disclosure text
   again in HTML, a "Delete this photo" button, and the intake or portal
   next-step CTA.
6. Refusal screen: the server's `user_message` verbatim plus the retake button.

No live pose overlay, no MediaPipe. That is V2.

**Done when.** Works on iOS Safari and Android Chrome; a phone photo from the
camera completes the flow; a refused photo shows the message and allows retry
without re-entering the goal; a run entered in metric produces metric labels
and one entered in imperial produces imperial labels, verified by test.

### V-7 Simulate API and Modal bridge

**Problem.** The prototype is a CLI. The site is Node.

**Work.** Modal side: add two web endpoints to `modal_app.py` protected by a
bearer token from a Modal secret: `POST /submit` accepts the JPEG and params,
spawns the simulate function, returns a call id; `GET /result?id=` returns
pending, or the record plus images. Keep the container scaled to zero with a
10-minute idle window so back-to-back users hit a warm container. Pin the model
version string into every record.

Site side: `POST /api/simulate` (multipart, 8 MB cap, rate-limited per user and
IP) checks credential (V-4), consent (V-5), goal validity, and units, stores
the photo via V-1, calls Modal submit, stores the call id on a pending
`Simulation` row. A refusal from the pre-filter still stores the photo (7-day
clock) and the reasons, so V-9 can show what was rejected. The same route,
with an admin session and a `rerun_of` simulation id plus config overrides,
drives the admin re-run in V-9 against the already stored photo.
`GET /api/simulate/status` polls Modal, and on completion stores the output
PNGs via V-1, writes the diagnostics, and returns the images as base64 data URLs
in the JSON body. Images are never served from a GET URL, so no photo
identifier ever appears in a URL, a referrer, or a cache. Responses carry
`Cache-Control: no-store`. The cap from B-3 is applied here, server-side, and
both requested and applied goal are recorded.

Never log the request body, the params, or the diagnostics. Log only ids,
timings, and refusal codes.

**Done when.** End to end from phone to result in under 90 s warm; a Modal
outage returns a friendly error and leaves no orphaned photo; the
`MODAL_TOKEN` and `PHOTO_ENCRYPTION_KEY` are the only new env vars; a
simulation record can be traced to its model version.

### V-8 Delete, retention, and kill switch

**Problem.** Nothing is ever deleted, and the existing cleanup functions never
run.

**Work.** `DELETE /api/simulate/photo` removes the photo, every output, and the
rows, and records the deletion in `AuditLog` by id only. A retention sweep
runs daily as a Railway cron service executing `scripts/retention.ts`, which
also runs the two existing cleanup functions from R-10. A `simulator_enabled`
flag in the admin settings file turns the feature off instantly without a
deploy; the page shows a "temporarily unavailable" message.

**Done when.** A deleted photo is gone from disk and Postgres within the
request; an expired photo is gone within a day; flipping the flag hides the
feature within a minute.

### V-9 Admin view and troubleshooting

**Problem.** Early on, patients are more likely to report a bad result than a
good one, and staff need to see exactly what was generated and why. Without the
stored images and diagnostics there is nothing to troubleshoot from.

**Work.** On the existing patient detail page, a "Simulations" section that
gives an admin, for every simulation still within retention:

- The list: date, cohort, units, goal requested and goal applied, outcome
  (success, refused with reasons, or failed), model version.
- The images: original photo and every output, fetched through the same
  POST-only path as the patient view, shown side by side. Refused photos are
  viewable for their 7-day window with the refusal reasons and the message the
  person saw.
- The diagnostics panel: the full stored record from V-2 rendered readably.
  The fields that explain most complaints are called out at the top: fit
  uncertainty, implied-versus-stated weight ratio, mask coverage, waist change,
  maximum displacement, which gates fired, which inpainter ran, and stage
  timings. Config values used for the run are listed so a result can be
  reproduced.
- Re-run: an admin can re-run the same stored photo with adjusted config, for
  example face gain or the solver weights, and see the new result next to the
  original run. Re-runs are stored as new simulations flagged `admin_rerun`
  and are never shown to the patient unless an admin explicitly promotes one.
  This is how tuning decisions get made from real complaints instead of
  guesses.
- Download of the original and outputs for a support thread, watermarked with
  the simulation id, audit logged.
- Delete button for the whole simulation or the photo.

All admin views and downloads are audit logged by id, never by content.

**Done when.** An admin can find, view, compare, re-run, download, and delete a
simulation for a named patient; the diagnostics shown match `record.json` from
the pipeline field for field; a non-admin cannot reach any of these routes;
every admin access appears in the audit log.

### V-10 Launch checks

**Work.** Before the feature flag is turned on:

- Five test subjects including at least one man and one loss above 30% of body
  weight, each producing an acceptable result by your judgment, with the
  records kept as a regression set.
- Three deliberately bad photos (cropped, low resolution, two people) each
  refused with the right message.
- Grep the deployed HTML of `/simulate` for every tracking vendor domain: none
  present.
- Privacy policy updated to mention photos, retention, and deletion.
- Typical-results figure and its source in config.
- License paperwork from B-1 on file.

## Sequencing

Work that does not depend on licensing or business input:

1. R-1, R-2, R-3, R-6, R-11 (remediation, about a week).
2. V-1, V-2, V-3 (storage, schema, authorization, a few days).
3. V-7 Modal bridge, which can be tested with the prototype's non-commercial
   models in a staging environment.
4. V-4, V-5, V-6, V-8, V-9.

In parallel from day one: B-1 licensing, B-2 typical-results figure, B-3
decision, privacy text for V-5.

Rough total for one engineer: three to four weeks of build after remediation,
with launch gated on B-1.

## Explicitly deferred to V2

Guided live capture with pose overlay, follow-up photo matching, calibration
and any training use, profile-view fitting, percentile-outcome ranges,
worker service and bucket storage, shorter cold starts via a warm container.

## Open questions

1. Do you want the simulator on the intake success screen only, or also as a
   standalone entry from the marketing site that starts with phone
   verification? The latter widens the pre-signup audience and the number of
   photos held.
2. Retention period for non-converting leads: 30 days is proposed.
3. Should the goal weight be free entry, or a slider capped at the program's
   typical outcome with the cap visible? A visible cap is easier to defend.
4. Who owns the consent and privacy text? It gates V-5.
