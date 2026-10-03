# Port Notes — infinityu-website intake-simulator branch

Conservative decisions made during the port, documented per HANDOVER.md section 8.

---

## Open Decision: Patient identification field (section 8)

**Choice made:** `User.isPatient Boolean @default(false)` instead of `asherPatientId String?`

**Reason:** Infinity-U prescribes directly (no Asher Med integration). Retention
logic needs a boolean to distinguish leads from patients; `isPatient` is the
simplest correct representation. Admin sets it to `true` when a prescription is
issued.

**Impact:** Retention period uses the lead window (default 30 days) until an admin
manually marks the user as a patient. There is no automatic transition.

---

## Open Decision: SimulatorCohort — no `post_login` (section 8)

**Choice made:** Dropped `post_login` from the active code paths entirely.
`simulator-subject.ts` always returns `{ cohort: 'pre_signup' }` for cookie
holders. `SimulatorFlow.tsx` removed the "Back to portal" branch.

**Reason:** Infinity-U has no patient portal. The `post_login` path assumes a
NextAuth session and a `/portal` route, neither of which exist here.

---

## Open Decision: Phone sign-in — sim_access cookie instead of NextAuth session (section 5.6)

**Choice made:** `verify-code` for `purpose === 'login'` calls
`issueSimAccessToken()` and sets `sim_access` cookie. No patient NextAuth JWT is
issued.

**Reason:** The handover explicitly specifies this. Patients do not have admin
credentials; creating a parallel patient session mechanism would add scope.

---

## Open Decision: email.ts stubbed (section 5.4)

**Choice made:** `email.ts` is a no-op stub (`isEmailConfigured() → false`,
`sendWeightManagementAssessmentEmail() → { success: false }`).

**Reason:** Infinity-U's email provider is not defined yet. The intake route uses
`sendWeightManagementAssessmentEmail` but gracefully continues when email is not
configured. Real implementation can be added when the provider is chosen.

---

## Infrastructure requirements (section 5.10)

Before launching the simulator, the following Railway variables must be set on
the `infinityu-website` service:

| Variable | How to generate |
|---|---|
| `PHOTO_ENCRYPTION_KEY` | `openssl rand -base64 32` (new, never shared) |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `SIMULATOR_API_TOKEN` | Infinity-U's token (provided out of band) |
| `SIMULATOR_SUBMIT_URL` | `https://jack-47734--bodysim-submit.modal.run` |
| `SIMULATOR_RESULT_URL` | `https://jack-47734--bodysim-result.modal.run` |
| `TWILIO_ACCOUNT_SID` | From Twilio console (or via admin settings) |
| `TWILIO_AUTH_TOKEN` | From Twilio console (or via admin settings) |
| `TWILIO_VERIFY_SERVICE_SID` | From Twilio console (or via admin settings) |

A Railway volume must be mounted at `/app/data`; photos go to `data/photos/`
and are lost on redeploy without a persistent volume. `/data/photos` is in both
`.gitignore` and `.dockerignore`.

Retention cron: run `POST /api/cron/retention` daily with header
`x-cron-secret: $CRON_SECRET`. The handover source includes a Modal cron at
`source/simulator/modal_cron.py` — change the app name to `infinityu-cron` and
deploy with appropriate secrets.

---

## Branding TODOs (HANDOVER.md section 6)

The following strings still reference MeltAwayMD and must be updated before
launch:

- `src/lib/consent-text.ts` — "MeltAwayMD" (twice); bump `PHOTO_CONSENT_VERSION`
- `src/lib/simulator-service.ts` — SMS texts begin `Infinity-U:` (already changed in port)
- `src/components/intake/HealthAssessment.tsx` — success screen copy (support email)
- `src/components/intake/questions.ts` — consent/disclaimer step wording
- `src/components/intake/i18n/es.ts`, `i18n/th.ts` — same copy in Spanish/Thai

The simulator result disclosure line was already updated to reference InfinityU
Med Spa's licensed medical providers (section 5.7).
