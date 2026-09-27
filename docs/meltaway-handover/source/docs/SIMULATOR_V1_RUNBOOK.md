# Body Simulator V1: Deployment Runbook

Companion to `docs/SIMULATOR_V1_PLAN.md`. Everything below is needed before the
feature can be switched on. The feature ships **off** (`simulator_enabled` is
false by default) and stays off until an admin turns it on.

## 1. GPU service (Modal)

From `simulator/` with the venv active and Modal authenticated:

```bash
# one-time: the bearer token the site uses to call the service
modal secret create bodysim-api SIM_API_TOKEN="$(openssl rand -hex 32)"

# model files (if not already on the volume)
modal run modal_app.py::download_models
modal volume put bodysim-models /path/to/SMPLX_NEUTRAL.npz /smplx/SMPLX_NEUTRAL.npz

# deploy the web endpoints; note the two printed URLs
modal deploy modal_app.py
```

The deploy prints URLs of the form `https://<workspace>--bodysim-submit.modal.run`
and `https://<workspace>--bodysim-result.modal.run`. Keep the same token value
you put in the secret; the site needs it too.

The service keeps nothing between calls. A container stays warm for ten minutes
after the last request. Measured on 2026-09-20 after moving the face pass to the
GPU: about 70 seconds end to end on a fresh container, about 45 seconds warm.
After a `modal deploy`, containers from the previous version can keep serving
for a few minutes; if a test right after a deploy looks like old behavior,
wait ten minutes and retry.

## 1b. Local staging (this Mac)

Set up on 2026-09-20 and not publicly reachable:

- Postgres 16 via Homebrew (`brew services start postgresql@16`), database
  `meltaway_staging`, user `meltaway`.
- `.env.development.local` (gitignored) overrides `DATABASE_URL` and adds the
  five simulator variables for `next dev` only. Production `.env.local` values
  are untouched.
- Migrations applied; an admin user exists for `jackzarris@gmail.com`.
- Start with `npm run dev`; open `http://localhost:3000` on this Mac or
  `http://192.168.86.64:3000` from a phone on the same Wi-Fi.

Phone OTP for intake and patient login needs Twilio credentials in the local
settings (admin Setup page) or in `.env.local`.

## 2. Site environment variables (Railway)

| Variable | Value |
|---|---|
| `PHOTO_ENCRYPTION_KEY` | `openssl rand -base64 32`. Encrypts every stored photo and output. Never reuse `NEXTAUTH_SECRET`. Losing it makes stored photos unreadable, which is the intended failure mode. |
| `SIMULATOR_SUBMIT_URL` | submit URL from the Modal deploy |
| `SIMULATOR_RESULT_URL` | result URL from the Modal deploy |
| `SIMULATOR_API_TOKEN` | the same value as `SIM_API_TOKEN` in the Modal secret |
| `CRON_SECRET` | `openssl rand -hex 32`. Protects the retention endpoint. |

Confirm the Railway volume is mounted at `/app/data`; photos are written under
`data/photos/` and are lost on redeploy if the volume is missing.

## 3. Database

The deploy runs `prisma migrate deploy` automatically (see
`scripts/docker-entrypoint.sh`). The migration `20260920120000_simulator_v1`
adds four tables and is purely additive.

## 4. Retention

Photos expire by date (30 days for people without an Asher order, 365 for
patients, 7 for refused photos; all adjustable in the admin Simulator page).
Expired photos are deleted by a sweep that runs:

- opportunistically about once an hour when the simulator is used, and
- on demand, for a daily schedule, by calling:

```bash
curl -X POST https://www.meltawaymd.com/api/cron/retention -H "x-cron-secret: $CRON_SECRET"
```

Set that up as a Railway cron service (or any scheduler) once a day. The same
sweep also runs the audit-log and trusted-browser cleanups that previously
never ran.

## 5. Turning it on

In the admin panel, Simulator page:

1. Enter the typical-results text. It is burned into every image. It must be a
   substantiated figure with a source before any customer sees it.
2. Check the goal cap (default 20% of current weight) and retention days.
3. Tick Enabled.

The feature appears on the intake success screen and in the portal navigation
within a minute. Untick Enabled to hide it just as fast.

## 5b. Progress, texts, and phone sign-in

- The GPU service publishes its stage to a Modal dictionary while it runs; the
  page shows a real progress bar. Before the container has started, the bar
  pulses at "Starting up".
- "Text me when it's ready" (or closing the page mid-run) asks for one SMS on
  completion, sent through the existing Twilio messaging setup, so
  `TWILIO_FROM_PHONE` must be configured. The text contains no health data and
  links to `/auth/phone`.
- `/auth/phone` signs in with a phone number and a one-time code. It works for
  people who verified a phone at intake but never set a password. Returning to
  `/simulate` afterwards shows the latest result.
- The server keeps watching a run for up to 15 minutes after the browser
  leaves; a restart resumes watching recent pending runs on the next request.

## 6. Verifying a deploy

- Open `/simulate` while logged out: you should see the "complete the health
  assessment or sign in" screen, and the page HTML must contain no tracking
  vendor domain (`googletagmanager`, `facebook.net`, `tiktok`, `bing`).
- Complete intake with a test phone, tap "See what your goal could look like",
  accept consent, submit a photo. Expect about a minute to a result.
- Upload a cropped or tiny photo: expect the retake message and no images.
- In the admin Simulator page, find the run, view it, and re-run it with a
  different face gain. The re-run appears as a separate row.
- Delete the photo from the patient result screen; the admin view should no
  longer find it.

## 7. Still required before customers see it

- Commercial licenses for SMPL-X and the fitting model (plan item B-1).
- A substantiated typical-results figure (B-2).
- Privacy policy text covering photos, retention, and deletion, and review of
  the consent text in `src/lib/consent-text.ts`.
- The five-subject and three-bad-photo checks in plan item V-10.
