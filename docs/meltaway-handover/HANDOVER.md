# Handover: Intake + Body Simulator for infinity-u.com

Written 2026-09-27 for Claude Code working in the `infinityu-website` repo.
Source of truth is the `meltawaymd` repo at commit `beea2d4` or later on `main`.
This document plus the `source/` bundle beside it is everything needed to port
the health-assessment intake and the body simulator to infinity-u.com.

**One difference from MeltAwayMD: no Asher Med.** Infinity-U prescribes on its
own, so every Asher integration (order creation, patient sync, portal links,
the "AsherMed" tag) is out of scope. Zoho CRM and AestheticIQ sync are also
excluded unless Infinity-U asks for them; both are optional, settings-driven
modules in the source and are simply not ported.

---

## 1. What is being ported

| Piece | What it does | Port? |
|---|---|---|
| Health assessment intake (`/intake`) | 8-step questionnaire: contact, goals, health screening, medical history, mental health, allergies, consent. Phone verified by SMS code before submission. Eligibility logic per product. English, Spanish, Thai. | Yes |
| Intake API (`/api/intake`) | Validates, creates/updates a patient `User` (phone verified), stores `QuestionnaireSubmission`, records SMS consent, emails a weight-management summary to staff, sets the simulator access cookie. | Yes, minus Asher/Zoho/AestheticIQ blocks |
| SMS verification (`/api/auth/send-code`, `/api/auth/verify-code`) | Twilio Verify, durable rate limits with lockout. | Yes |
| Phone sign-in (`/auth/phone`) | One-time-code sign-in for people who verified a phone at intake and have no password. | Yes, simplified (see 5.6) |
| Body simulator (`/simulate`) | Consent, imperial/metric inputs prefilled from intake, take/choose photo, in-browser EXIF-stripping downscale, upload, real progress bar, text-me-when-ready, result with disclosure, download, delete. | Yes |
| Simulator API (`/api/simulate/*`) | Encrypted photo storage on the Railway volume, goal capping, submit/poll to the GPU service, server-side watching, SMS on completion, deletion, retention. | Yes |
| GPU service (Modal) | Body-model fit, shape solve, warp, face pass, inpaint. Stateless. | **Reuse the existing deployment**; no port needed |
| Admin: Simulator page | Kill switch, typical-results text, cap, retention, list/search, view images + diagnostics, re-run, delete, unlock a locked phone. | Yes |
| Admin: patient row camera icon | Opens that patient's simulations. | Only if an admin patient list exists (Infinity-U has none today; skip) |
| Retention cron | Daily call to `/api/cron/retention`. | Yes (Modal scheduled job, own copy) |
| Privacy policy section | "Body Simulator Photos" section + link from the consent screen and photo picker. | Yes, reworded for Infinity-U |
| Remediation baseline | No tracking scripts on `/simulate` and `/auth`; PII-free logging with a static guard test; centralized authz. | Yes (small; Infinity-U has no tracking scripts today) |

Not ported: patient portal (`/portal`), patient email/password login, Asher,
Zoho, AestheticIQ, Instagram, chat widget, tags/notes, admin patient management.

---

## 2. Target repo facts (verified 2026-09-27)

Same stack as the source: Next.js 16.1.6 App Router, React 19, Prisma 6.19,
NextAuth 5 beta (credentials, JWT, admin only), Resend, Tailwind 4, Railway via
Dockerfile with `/api/health`. Differences that matter:

| Area | infinityu-website | meltawaymd | Consequence |
|---|---|---|---|
| Prisma client | generated to `src/generated/prisma`; import from `@/generated/prisma` | `@prisma/client` | Every ported file that imports `@prisma/client` types must import from `@/generated/prisma` |
| Schema management | no `prisma/migrations`; `db push` + `prisma/seed.ts` | migrations | Add models to `schema.prisma` and `db push` (or start a migrations dir; owner's call) |
| Settings | `Setting` table (key/value) via `src/lib/settings.ts` | `data/config/settings.json` | Simulator/Twilio settings become rows; adapt `getSimulatorSettings()` and the admin settings API |
| `User.role` default | `"user"` | `"patient"` | Ported code checks `role === 'patient'`; set the role explicitly when the intake creates a user, and the phone sign-in / cookie checks must use `'patient'` |
| `User` fields | no `phone`, `phoneVerified`, `dateOfBirth` | present | Add them (schema below) |
| Twilio | not installed | `twilio` 5 | `npm i twilio`; add credentials as settings or env |
| Tracking scripts | none | scoped component | Port `tracking-scope.ts` anyway so a future analytics add stays off `/simulate` |
| CSP middleware | present, similar (`connect-src 'self' ...`) | same | Nothing to change; note the download button must not use `fetch()` on data URLs (already fixed in source) |
| UI components | `Button`, `Card`, `Badge`, `Accordion`, `Section`, `EmailLink` | plus `Input`, `Select`, `Textarea` | The simulator components use only `Button` and `Card`; the intake `HealthAssessment.tsx` uses plain inputs. Check `Button` props (`variant`, `size`, `isLoading`, `leftIcon`) match; adapt if not |
| Admin nav | `src/components/admin/AdminNav.tsx` | same shape | Add a "Simulator" item |
| Entry point | `/weight-loss` page with booking CTAs | `/intake` linked from nav | Add `/intake` and link it from the weight-loss page and nav |

Security note for the repo owner, unrelated to the port: `.claude/settings.json`
in `infinityu-website` contains a production `DATABASE_URL` with its password
inside allowed-command strings. Rotate that password and remove the entries.

---

## 3. Architecture (as it will run on infinity-u.com)

```
phone/browser
  │  /intake  ── send-code / verify-code (Twilio Verify, DB rate limits)
  │          └─ POST /api/intake → User(patient, phone verified) + QuestionnaireSubmission
  │                                + SmsConsent + staff email + sim_access cookie (24 h)
  │
  │  /simulate (needs sim_access cookie)
  │     ├─ GET  /api/simulate/context   prefill, consent state, availability
  │     ├─ GET/POST /api/simulate/consent
  │     ├─ POST /api/simulate           multipart photo + params → encrypted file on volume,
  │     │                               BodyPhoto + Simulation rows, submit to GPU service
  │     ├─ POST /api/simulate/status    { simulationId } → progress | images (base64 in body)
  │     ├─ POST /api/simulate/notify    text me when ready (also sent as a beacon on page close)
  │     └─ POST /api/simulate/delete
  │
  │  /auth/phone   phone + code → new sim_access cookie → /simulate (resumes latest run)
  │
  ├─ Modal GPU service (shared, stateless)   submit → call_id; result?id → pending{stage}|done|failed
  ├─ Railway volume  data/photos/<uuid>.bin   AES-256-GCM under PHOTO_ENCRYPTION_KEY
  └─ Postgres        metadata only; never image bytes

admin (/admin/simulator): settings + kill switch, list, view, re-run, delete, unlock phone
daily: POST /api/cron/retention (x-cron-secret) → expired photos deleted, cleanups run
```

Rules the code enforces and the port must keep:

- Photo bytes never appear in a URL, a log line, or Postgres. Images travel only
  inside POST response bodies as data URLs.
- No third-party script on `/simulate`, `/auth/*`, `/admin/*`.
- Logs carry ids, codes, timings only. `src/lib/no-pii-logging.test.ts` fails
  the build if a console call prints an intake or health object.
- Every patient-owned read goes through `requireOwnedRecord`; every admin route
  through `requireAdminApi`.

---

## 4. Shared GPU service (Modal)

Reuse the deployment that already serves meltawaymd.com. Nothing about it is
site-specific; the site passes the typical-results text and labels per call.

| Setting | Value |
|---|---|
| `SIMULATOR_SUBMIT_URL` | `https://jack-47734--bodysim-submit.modal.run` |
| `SIMULATOR_RESULT_URL` | `https://jack-47734--bodysim-result.modal.run` |
| `SIMULATOR_API_TOKEN` | Infinity-U has its **own** token, provided out of band (not in this repo). The service accepts several tokens, one per site, so either can be rotated alone. |

Performance: about 45 s warm, about 70 s on a fresh container; containers stay
warm ten minutes. Cost roughly 2 cents per image.

If Infinity-U later wants its own deployment, `source/simulator/` is the
complete service; `README.md` and `docs/SIMULATOR_V1_RUNBOOK.md` cover setup
(Modal account, model files, `modal secret create bodysim-api`, `modal deploy`).

**Licensing, unchanged and unresolved:** the body model (SMPL-X) and the fitter
(NLF) weights are licensed for non-commercial research use. Running this for
customers on a second site does not change that. Commercial licensing is being
handled by the owner; the feature ships disabled and should stay so until that
is settled.

---

## 5. Port plan, in order

Each step lists what to do and how to know it's done. Paths are relative to the
target repo; "source" paths refer to the bundle in `source/`.

### 5.1 Dependencies and scripts

```bash
npm i twilio
```

Add to `package.json` scripts:

```json
"test": "node --test \"src/**/*.test.ts\"",
"typecheck": "tsc --noEmit -p tsconfig.json"
```

Add `"allowImportingTsExtensions": true` to `tsconfig.json` compilerOptions
(the tests import with `.ts` extensions so Node's built-in runner can strip
types; no test framework needed).

Done when: `npm test` runs (zero tests yet) and `npm run typecheck` passes.

### 5.2 Schema

Add to `prisma/schema.prisma` (then `npx prisma db push` and `npx prisma generate`).
These are the exact models from the source, minus `asherPatientId`.

```prisma
// --- add to model User ---
  phone                    String?
  phoneVerified            Boolean                   @default(false)
  dateOfBirth              String?
  questionnaireSubmissions QuestionnaireSubmission[]
  photoConsents            PhotoConsent[]
  bodyPhotos               BodyPhoto[]
  simulations              Simulation[]

model QuestionnaireSubmission {
  id                 String   @id @default(cuid())
  userId             String?
  user               User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  email              String
  firstName          String
  lastName           String
  phone              String
  dateOfBirth        String
  state              String
  biologicalSex      String?
  selectedGoals      String   // JSON array
  answers            String   // JSON object
  eligibleProducts   String   // JSON array
  ineligibleProducts String   // JSON array of {productId, reason}
  healthSummary      String?
  submissionLanguage String   @default("en")
  languagesUsed      String   @default("[\"en\"]")
  ipAddress          String?
  userAgent          String?
  submittedAt        DateTime @default(now())

  @@index([userId])
  @@index([email])
  @@index([submittedAt])
}

model RateLimitBucket {
  key         String    @id
  count       Int       @default(0)
  windowStart DateTime
  lockedUntil DateTime?
  updatedAt   DateTime  @updatedAt

  @@index([windowStart])
}

model PhotoConsent {
  id          String    @id @default(cuid())
  userId      String
  version     String
  textShown   String
  purposes    String
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  withdrawnAt DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos      BodyPhoto[]

  @@index([userId])
}

model BodyPhoto {
  id             String       @id @default(cuid())
  userId         String
  consentId      String
  storageKey     String       @unique
  sha256         String
  width          Int
  height         Int
  contentType    String       @default("image/jpeg")
  capturedAt     DateTime     @default(now())
  retentionAt    DateTime
  deletedAt      DateTime?
  status         String       @default("accepted")
  refusalReasons String?
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  consent        PhotoConsent @relation(fields: [consentId], references: [id])
  simulations    Simulation[]

  @@index([userId])
  @@index([retentionAt])
}

model Simulation {
  id                    String    @id @default(cuid())
  photoId               String
  userId                String
  cohort                String
  units                 String    @default("imperial")
  paramsMetric          String
  paramsDisplay         String
  goalWeightKgRequested Float
  goalWeightKgApplied   Float
  status                String    @default("pending")
  remoteCallId          String?
  outputKeys            String?
  diagnostics           String?
  refusalReasons        String?
  userMessage           String?
  modelVersion          String?
  configOverrides       String?
  rerunOfId             String?
  notifyRequested       Boolean   @default(false)
  notifiedAt            DateTime?
  createdAt             DateTime  @default(now())
  completedAt           DateTime?
  deletedAt             DateTime?
  photo                 BodyPhoto @relation(fields: [photoId], references: [id], onDelete: Cascade)
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([photoId])
  @@index([status])
  @@index([createdAt])
}
```

`SmsConsent` and `AuditLog` already exist in the target with compatible shapes.
Add these values to the audit action union in `src/lib/audit.ts`:
`otp_locked`, `intake_submitted`, `intake_failed`, `simulation_created`,
`simulation_viewed`, `simulation_deleted`, `simulation_rerun`,
`photo_consent_given`, `photo_consent_withdrawn`, `photo_deleted`.

Done when: `db push` succeeds and `prisma generate` emits the new models under
`src/generated/prisma`.

### 5.3 Settings (DB-backed)

The source reads these from JSON; on Infinity-U they are `Setting` rows. Keys:

| Key | Type | Default | Purpose |
|---|---|---|---|
| `twilio_account_sid`, `twilio_auth_token`, `twilio_verify_service_sid` | string | env fallback | SMS verification |
| `twilio_from_phone` | string | env fallback | "your simulation is ready" texts |
| `admin_notification_phone` | string | | optional SMS to staff on each intake |
| `contact_notification_email` | string | `CONTACT_EMAIL` | staff email for intake summaries |
| `simulator_enabled` | boolean | false | kill switch |
| `simulator_typical_results` | string | placeholder | burned into every image; must be substantiated |
| `simulator_max_loss_fraction` | number | 0.2 | goal cap as a fraction of current weight |
| `simulator_retention_days_lead` | number | 30 | photo retention for people without an order |
| `simulator_retention_days_patient` | number | 365 | photo retention for patients |

Implement `getSimulatorSettings()` (see source `src/lib/settings.ts`, the
`SimulatorSettings` block) on top of the target's `getSettings()`. Extend the
admin settings API's allowed keys and the boolean/number/fraction handling
(source `src/app/api/admin/settings/route.ts`, search `simulator_`).

**Retention without Asher.** The source decides "patient vs lead" by
`asherPatientId`. Infinity-U has no such signal. Recommended: use the lead
period for everyone unless an admin marks the account as a patient. Simplest
implementation: a `User.isPatient Boolean @default(false)` column toggled from
the admin Simulator view (one extra button). Until that exists, every photo
gets the lead period. Adjust `retentionDateFor()` in `simulator-service.ts`
accordingly.

Done when: the admin can read and write every key above.

### 5.4 Library files (copy, then adapt imports)

Copy from `source/src/lib/` into `src/lib/`:

| File | Adaptation |
|---|---|
| `twilio.ts` | read credentials via the target `getSettings()`; drop `notifyAdminOfIntake` if `admin_notification_phone` is not wanted |
| `rate-limit.ts` | none (file-based per-IP limiter used by intake endpoints; keep) |
| `rate-limit-db.ts` | Prisma import path |
| `log.ts`, `log.test.ts`, `no-pii-logging.test.ts` | none |
| `api-utils.ts` | none |
| `tracking-scope.ts`, `tracking-scope.test.ts` | none |
| `authz-core.ts`, `authz-core.test.ts`, `authz.ts` | `Session` type import is from `next-auth`; `role === 'patient'` stays |
| `photo-crypto.ts`, `photo-crypto.test.ts`, `photo-store.ts` | none |
| `sim-access.ts`, `sim-access.test.ts`, `simulator-subject.ts` | in `simulator-subject.ts` drop the NextAuth patient-session branch if no patient sessions exist (see 5.6); keep the cookie branch and its `role === 'patient' && isActive` check |
| `consent-text.ts` | reword for Infinity-U (company name, "contracted computing provider" stays true) and bump `PHOTO_CONSENT_VERSION` |
| `units.ts`, `units.test.ts`, `image-dims.ts`, `image-dims.test.ts` | none |
| `simulator-client.ts` | none |
| `simulator-service.ts` | Prisma import path; retention rule (5.3); SMS wording (`MeltAwayMD:` → `Infinity-U:`); `siteBaseUrl()` from `NEXT_PUBLIC_SITE_URL` or `NEXTAUTH_URL` |
| `email.ts` (only `sendWeightManagementAssessmentEmail` and `isEmailConfigured`) | merge into the target's existing Resend helper; change sender and branding |
| `audit.ts` | do not copy; add the action names to the target's union |

Done when: `npm run typecheck` and `npm test` pass (the ported unit tests: 24
in the source).

### 5.5 Intake

Copy `source/src/components/intake/` (all files, including `i18n/`) and
`source/src/app/intake/page.tsx`. The components have no Asher references.
Check `products.ts`: it lists the medications the questionnaire screens for
(GLP-1s, peptides, NAD+, etc.). Infinity-U should confirm this is their menu;
remove products they do not offer. Eligibility rules live in `eligibility.ts`.

Copy `source/src/app/api/intake/route.ts` and remove:

- imports and the blocks for `@/lib/zoho` (createContact/createLead/createCustomRecord), `@/lib/aestheticiq`, `@/lib/asher`, and the local JSON fallback under `data/submissions` (Zoho-off path).
- `addStateTag` / any `tag` usage (no tags on Infinity-U).
- `asherPatientId` anywhere.

Keep: validation, patient `User` create/update (set `role: 'patient'` explicitly
on create), `QuestionnaireSubmission` create, `SmsConsent` rows, staff email,
admin SMS (optional), audit events, and the `sim_access` cookie at the end.

Copy `source/src/app/api/auth/send-code/route.ts` and `verify-code/route.ts`.
In `verify-code`, the `purpose === 'login'` branch mints a NextAuth session; see
5.6 for the simplification.

Link `/intake` from the weight-loss page CTAs and the nav ("Start your
assessment" or similar; the owner picks the wording).

Done when: a real phone completes intake on staging, a `QuestionnaireSubmission`
row exists, the staff email arrives, and repeated wrong codes lock the number.

### 5.6 Phone sign-in, simplified

Infinity-U has no patient portal, so there is no need for patient NextAuth
sessions. Replace the session-minting in `verify-code` (`purpose === 'login'`)
with: verify the code, look up the active patient by phone, and set a fresh
`sim_access` cookie (`issueSimAccessToken` + `simAccessCookieOptions`), then
return `{ authenticated: true }`. `PhoneLogin.tsx` already redirects to
`/simulate`, which reads that cookie and resumes the latest run.

Copy `source/src/app/auth/phone/page.tsx` and `source/src/components/auth/PhoneLogin.tsx`.
The "Have a password? Sign in with email" link at the bottom should be removed.

Done when: the "ready" text's link signs a person in by phone and lands on their
result.

### 5.7 Simulator pages and API

Copy as-is, then fix imports:

- `source/src/app/simulate/page.tsx`
- `source/src/components/simulator/SimulatorFlow.tsx`, `image-prep.ts`
- `source/src/app/api/simulate/route.ts`, `status/`, `delete/`, `consent/`,
  `context/`, `notify/`
- `source/src/app/api/cron/retention/route.ts`

In `SimulatorFlow.tsx`, the result screen's "Back to portal" branch (cohort
`post_login`) can go; all Infinity-U users are `pre_signup`. Change the
"Medical services are provided independently by licensed medical providers"
line to whatever Infinity-U's own disclosure is, since they prescribe directly.

The `/simulate` page's logged-out screen links to `/intake` and `/auth/login`;
change the second to `/auth/phone`.

Done when: the full flow works on staging from a phone, the refusal path shows
the retake message for a cropped photo, the progress bar shows stages, and
closing the page mid-run produces a text.

### 5.8 Admin

Copy `source/src/app/admin/(protected)/simulator/page.tsx`,
`source/src/app/api/admin/simulations/` (list, view, rerun, delete) and
`source/src/app/api/admin/security/otp-unlock/route.ts`. Replace inline
`session.user.role !== 'admin'` checks with `requireAdminApi()` from `authz.ts`
(the target's existing routes can be migrated the same way over time; not
required for the port). Add "Simulator" to `AdminNav.tsx`.

The admin settings card on that page writes the keys from 5.3 through
`POST /api/admin/settings`; adapt to the target's settings API shape.

Done when: an admin can enable the feature, set typical-results text, search a
simulation by email, view images and diagnostics, re-run with a different face
gain, delete, and unlock a phone.

### 5.9 Privacy policy and consent

Add the "Body Simulator Photos" section to `src/app/privacy/page.tsx` with
`id="body-simulator-photos"` (source text in `source/src/app/privacy/page.tsx`,
section 5a) reworded for Infinity-U. The consent screen and photo picker link
to `/privacy#body-simulator-photos`. Keep the consent text and the policy in
agreement, especially the retention periods.

### 5.10 Environment and infrastructure

Railway variables on the infinityu-website service:

| Variable | Value |
|---|---|
| `PHOTO_ENCRYPTION_KEY` | `openssl rand -base64 32`; new, never shared with meltawaymd |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `SIMULATOR_API_TOKEN` | Infinity-U's token (out of band) |
| `SIMULATOR_SUBMIT_URL`, `SIMULATOR_RESULT_URL` | the shared URLs in section 4 |
| `TWILIO_*` | if not stored as settings |

Confirm a Railway volume is mounted at `/app/data`; photos go to `data/photos/`
and are lost on redeploy without it. Add `/data/photos` to `.gitignore` and
`.dockerignore`.

Retention cron: copy `source/simulator/modal_cron.py`, change the app name to
`infinityu-cron`, create secret `infinityu-cron` with `CRON_SECRET` and
`SITE_URL=https://www.infinity-u.com`, `modal deploy`. Or use any scheduler that
can POST once a day with the `x-cron-secret` header.

### 5.12 Results & Refund Acknowledgment step (Infinity-U specific; added 2026-10-03)

The source now contains a configurable final questionnaire step, shown after
"Review & Confirm" and before the results screen and the simulator. It is
**off on meltawaymd.com** and **must be on for infinity-u.com**:

```
NEXT_PUBLIC_INTAKE_RESULTS_ACKNOWLEDGMENT=true
```

Set it in Railway (it is read by both the browser bundle and the server, so a
redeploy is needed after setting it).

What it does:

- `src/components/intake/acknowledgments.ts` holds the legal text verbatim
  (two paragraphs: results not guaranteed; all payments final) and the checkbox
  label, with a version string. The text already names InfinityU; do not
  reword it without bumping `version`.
- `questions.ts` appends step `results_acknowledgment` with one question of
  type `acknowledgment` when the flag is on. `HealthAssessment.tsx` renders
  the paragraphs in a box and a single checkbox; the step cannot be passed
  until it is ticked.
- On submit the browser sends `acknowledgments: [{id, version, title, text,
  checkboxLabel, acceptedAt}]`. The API refuses the submission (400) if the
  flag is on and the current version is missing, and stores the array verbatim
  in `QuestionnaireSubmission.acknowledgments` (new nullable text column; add
  it to the schema in 5.2).
- The admin questionnaire view lists each acknowledgment with its version,
  acceptance time, full text, and the ticked label, so a refund dispute can be
  answered from the record.

Files touched (all in the bundle): `src/components/intake/acknowledgments.ts`
(new), `types.ts`, `questions.ts`, `HealthAssessment.tsx`,
`src/app/api/intake/route.ts`, `src/app/api/admin/patients/[id]/questionnaires/route.ts`
(reference), `prisma/migrations/20261003000000_questionnaire_acknowledgments/`.

The legal text is English only; the Spanish and Thai translation files do not
cover it (translation of legal text is a decision for the owner, not an
automatic one). The step title and description fall back to English.

### 5.11 Launch checks

Before `simulator_enabled` is turned on:

- Fetch `/simulate` HTML: no analytics vendor domains present.
- `POST /api/simulate/status` without a cookie: 401. `POST /api/cron/retention` without the header: 401.
- One real intake → simulation → text → phone sign-in → result → download → delete, on a phone, with a non-staff email.
- A cropped photo and a low-resolution photo both refused with the retake message.
- Admin: view, re-run, delete, unlock.
- Typical-results text entered with its source; privacy section published.
- Licensing resolved (section 4).

---

## 6. Branding and wording to change

| File | String |
|---|---|
| `src/lib/consent-text.ts` | "MeltAwayMD" (twice); bump version |
| `src/lib/simulator-service.ts` | SMS texts begin `MeltAwayMD:` |
| `src/lib/email.ts` | sender `MeltAwayMD <noreply@meltawaymd.com>`, logo URL, footer |
| `src/components/simulator/SimulatorFlow.tsx` | disclosure lines on the result screen; download filenames `meltawaymd-*.png` |
| `src/app/privacy/page.tsx` | section 5a text |
| `src/components/intake/HealthAssessment.tsx` | success screen copy ("A licensed medical provider will review...", support email); i18n strings in `i18n/es.ts`, `i18n/th.ts` carry the same copy |
| `src/components/intake/questions.ts` | consent/disclaimer step wording |

---

## 7. Known gotchas (all hit during the MeltAwayMD rollout)

- One browser holds one login. On MeltAwayMD a patient login replaced the admin session; on Infinity-U the simplified cookie sign-in avoids that, but staff should still test with a separate browser profile.
- Staff must test intake with a non-staff email; the intake now refuses to attach to an admin account, so a staff email silently gets no simulator link.
- OTP limits: 5 wrong codes / 15 min locks 30 min; 3 sends / 15 min locks 60 min. The admin unlock box clears it.
- After `modal deploy`, old containers can serve for a few minutes; results may look like old behavior briefly.
- The production CSP blocks `fetch()` on `data:` URLs; the download button decodes with `atob` (already in source).
- A file input with `capture` forces the camera on phones; two inputs are needed for camera vs library (already in source).
- Number inputs: 0 inches must be storable; the intake's number handling treats empty as `''` not `0` (already in source).

---

## 8. Open decisions for the Infinity-U owner

1. Product list and eligibility rules in `products.ts` / `eligibility.ts`: confirm they match what Infinity-U prescribes.
2. Typical-results figure and its source. Required before enabling.
3. Consent and privacy wording. Drafts are in the source; someone must own the final text.
4. Retention: single period for all, or mark patients in admin (5.3).
5. Keep Spanish and Thai translations? They come free but need review for Infinity-U wording.
6. Staff notifications: email only, or SMS too (`admin_notification_phone`).
7. Where `/intake` is linked from (weight-loss page, nav, announcement bar).

---

## 9. Bundle contents (`source/`)

Everything under `source/` keeps its original path in the meltawaymd repo.

```
source/
  src/app/intake/page.tsx
  src/app/simulate/page.tsx
  src/app/auth/phone/page.tsx
  src/app/privacy/page.tsx                   (reference; section 5a)
  src/app/api/intake/route.ts               (adapt; strip Asher/Zoho/AestheticIQ)
  src/app/api/auth/send-code/route.ts
  src/app/api/auth/verify-code/route.ts      (adapt; 5.6)
  src/app/api/simulate/{route.ts, status, delete, consent, context, notify}
  src/app/api/cron/retention/route.ts
  src/app/api/admin/simulations/{route.ts, view, rerun, delete}
  src/app/api/admin/security/otp-unlock/route.ts
  src/app/api/admin/settings/route.ts        (reference; simulator keys)
  src/app/admin/(protected)/simulator/page.tsx
  src/components/intake/**                   (incl. i18n)
  src/components/simulator/**
  src/components/auth/PhoneLogin.tsx
  src/components/admin/AdminNav.tsx          (reference; nav item)
  src/lib/{twilio,rate-limit,rate-limit-db,log,api-utils,tracking-scope,authz,authz-core,
           photo-crypto,photo-store,sim-access,simulator-subject,consent-text,units,
           image-dims,simulator-client,simulator-service,settings,email,audit}.ts
  src/lib/*.test.ts
  src/middleware.ts                          (reference; CSP)
  prisma/schema.prisma                       (reference)
  prisma/migrations/20260920120000_simulator_v1/migration.sql
  prisma/migrations/20260920160000_simulation_notify/migration.sql
  simulator/                                 (GPU service + local tooling, for reference or self-hosting)
  docs/SIMULATOR_V1_PLAN.md
  docs/SIMULATOR_V1_RUNBOOK.md
  docs/PHI_READINESS_SURVEY.md
  docs/weightloss_simulation.md
```
