# MeltAwayMD Codebase Survey: PHI Readiness

> Read-only inventory produced 2026-09-06 to evaluate whether this codebase can host a feature that handles patient body photos (potential PHI). No files were modified during the survey. Every finding cites the file it is based on. "Not present" means confirmed absent; "could not determine" means the answer is not in the repo.

---

## Stack

**Single Next.js app, no frontend/backend split.** Next.js 16.1.6 App Router, React 19.2.3, TypeScript 5, Tailwind 4. API routes live under `src/app/api/` and run in the same Node process.
Source: `package.json`, `next.config.ts`.

**Package manager:** npm, lockfile present.
Notable dependencies: `next-auth` 5 beta, `@prisma/client` 6, `twilio` 5, `resend` 6, `nodemailer` 7, `@anthropic-ai/sdk`, `bcryptjs`, `zod`, `react-hook-form`.
No image, upload, queue, cloud SDK, or observability packages.

**Mobile / PWA / service worker:** not present. No service worker, no manifest linked from the app, no Capacitor or React Native. A generic `site.webmanifest` exists at `logo/favicon/site.webmanifest`, but it is outside `public/`, is not referenced anywhere in `src/`, and still contains placeholder names, so it is not served.

---

## Deployment

**Railway config:** `railway.toml` uses the Dockerfile builder, health check on `/api/health`, restart on failure, one replica. No `railway.json`, nixpacks config, or Procfile.

**Dockerfile:** `Dockerfile` is a three-stage `node:22-alpine` build producing Next standalone output. The entrypoint `scripts/docker-entrypoint.sh` runs as root, creates `/app/data/config` and `/app/data/rate-limits`, runs `prisma migrate deploy`, then drops to a non-root user.

**Services defined:** one app container.
- `docker-compose.yml` adds a local Postgres 16 container and an `app-data` volume for `/app/data`.
- `docker-compose.prod.yml` is app only, expecting an external database.
- On Railway, the Postgres service and any `/app/data` volume are dashboard configuration, not in the repo. `docs/ARCHITECTURE.md` and `docs/RAILWAY_DEPLOYMENT.md` describe them, but their existence could not be confirmed from the code.

**Env var names referenced** (from `process.env.*` in `src/`, plus compose and docs; values were not read):

| Source | Names |
|---|---|
| Code | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_SECRET`, `NODE_ENV`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_FROM_PHONE`, `ADMIN_NOTIFICATION_PHONE`, `CONTACT_NOTIFICATION_EMAIL`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_POST_URLS`, `ASHER_API_KEY` |
| Docs / compose only | `AUTH_SECRET`, `PORT`, `HOSTNAME`, `NEXT_TELEMETRY_DISABLED`, `DOCKER_REGISTRY`, `VERSION`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |

Most third-party credentials can also be entered in the admin UI and are then stored in a JSON file on disk (`data/config/settings.json`), not in env. See `src/lib/settings.ts` and `src/app/api/admin/settings/route.ts`.

**AWS/GCP SDK or cloud resources:** not present. The only S3-related code is a wrapper for Asher Med's presigned-upload endpoints in `src/lib/asher.ts` (lines 447-465), and nothing calls it.

---

## Data

**Engine and ORM:** PostgreSQL via Prisma 6. Schema at `prisma/schema.prisma`, migrations at `prisma/migrations/`, lock file says `postgresql`. A SQLite file `prisma/dev.db` is tracked in git and contains the older table set.

**Tables and columns:**

| Table | Columns |
|---|---|
| User | id, name, email, emailVerified, image, phone, phoneVerified, dateOfBirth, asherPatientId, role, password, totpSecret, totpEnabled, isActive, createdAt, updatedAt |
| Account, Session, VerificationToken | Standard NextAuth tables. Session and Account are effectively unused because sessions are JWT |
| PasswordResetToken | id, userId, token, type, expires, used, createdAt |
| SupportMessage | id, userId, subject, message, status, timestamps |
| AuditLog | id, timestamp, action, actor, actorId, actorRole, target, targetId, ipAddress, country, userAgent, details (JSON string), success, expiresAt |
| SmsConsent | id, email, phone, firstName, lastName, consentType, consented, ipAddress, userAgent, source, consentText, timestamps |
| QuestionnaireSubmission | id, userId, email, firstName, lastName, phone, dateOfBirth, state, biologicalSex, selectedGoals (JSON), answers (JSON), eligibleProducts (JSON), ineligibleProducts (JSON), healthSummary, ipAddress, userAgent, submittedAt, zohoContactId, zohoLeadId, zohoSyncedAt |
| Tag, UserTag | Patient tagging |
| PatientNote | id, patientId, authorId, content, timestamps |
| TrustedBrowser | id, userId, tokenHash, userAgent, ipAddress, lastUsed, expiresAt, createdAt |
| InstagramPost | id, postUrl, imageData (Bytes), contentType, title, authorName, fetchedAt, sortOrder |

**Health-related or identifying columns:**
- `QuestionnaireSubmission.answers` holds the full intake: height, weight, diabetes, thyroid, cancer, kidney, pancreatitis, pregnancy, medications, allergies, mental health, family history.
- `QuestionnaireSubmission.healthSummary` is a plain-text rendering of the same data.
- `eligibleProducts` and `ineligibleProducts` name medications.
- `User.dateOfBirth`, `phone`, `email`, `name`.
- `PatientNote.content` is free-text admin notes about a patient.
- `AuditLog.details` stores chat prompts and responses, intake goals, and admin change sets.
- `SmsConsent` holds name, phone, email, IP.

**Application-layer encryption:** none on any column. `src/lib/encryption.ts` implements AES-256-GCM, but its only caller is `src/lib/zoho.ts` (lines 71-82), which encrypts the Zoho refresh token written to `data/config/zoho-tokens.json`. The key is derived from `NEXTAUTH_SECRET`, so the session-signing secret and the encryption secret are the same value. Passwords are bcrypt hashed. TOTP secrets are stored in plaintext in `User.totpSecret`.

**Object/blob storage:** not present. Files today go to three places:
- Instagram thumbnails are stored as `Bytes` in Postgres via `src/app/api/admin/instagram-sync/route.ts` and served publicly from `src/app/api/instagram-images/[id]/route.ts`.
- Logo and favicon uploads are written to `public/branding/` on the container filesystem by `src/app/api/admin/branding/route.ts` (lines 94-127). That directory is not on the data volume, so uploads are lost on redeploy.
- Intake submissions are written as JSON to `data/submissions/` when Zoho is not configured, at `src/app/api/intake/route.ts` (lines 524-531).

---

## Auth

**Phone OTP:** Twilio Verify. `src/lib/twilio.ts` calls `verify.v2.services(...).verifications.create` and `verificationChecks.create`. Two flows use it:
- Patient login is email plus password in `src/app/api/auth/patient-login/route.ts`, then an SMS code verified in `src/app/api/auth/patient-login/verify/route.ts`.
- A phone-only flow in `src/app/api/auth/send-code/route.ts` and `src/app/api/auth/verify-code/route.ts` serves both intake phone verification and a passwordless `purpose: 'login'` path that issues a session directly. The verify-code route has no rate limiting.

**Sessions:** NextAuth v5 with JWT strategy, no database adapter, in `src/lib/auth.ts`. Admin sessions are 24 hours. Patient sessions are minted manually with `encode()` in the two verify routes and set as an `httpOnly`, `secure` in production, `sameSite: lax` cookie with a 30-day lifetime. A separate 30-day trusted-browser cookie is set by `src/app/api/auth/trust-browser/route.ts`. `trustHost: true` is set.

**Roles:** a single `User.role` string with values `patient` and `admin`. No staff or provider role. Admin pages are gated in `src/app/admin/(protected)/layout.tsx`. The portal is gated only on "any session" in `src/app/portal/layout.tsx`.

**Owner scoping:** there is no shared helper. Each admin route repeats `session.user.role !== 'admin'` inline. The only patient-facing record access is `src/app/api/support/route.ts` (lines 80-83), which filters by `userId: session.user.id`. Patients cannot read their own questionnaire, notes, or profile through any API today, so there is no existing pattern for patient-owned records to reuse.

---

## Existing file handling

**Upload endpoints:**
- Branding: `<input type="file">` in `src/app/admin/(protected)/setup/page.tsx` (line 1358) posts multipart to `src/app/api/admin/branding/route.ts`, which checks MIME type and extension against an allowlist, caps size at 5 MB, and writes to `public/branding/`. Admin only.
- Instagram: `src/app/admin/(protected)/setup/page.tsx` (lines 545-560) reads a file with FileReader, base64-encodes it, and posts JSON to the instagram-sync route, which stores the bytes in Postgres. There is no size limit on that JSON body. Admin only.

**Image processing libraries:** not present. No sharp, jimp, multer, formidable, or busboy. No EXIF stripping, resizing, or content sniffing anywhere.

---

## Background work

**Job queue, worker, cron:** not present. Two cleanup functions exist, `cleanupExpiredAuditLogs` in `src/lib/audit.ts` and `cleanupExpiredTrustedBrowsers` in `src/lib/trustedBrowser.ts`, but nothing calls them. The 90-day audit retention in the schema comment is therefore not enforced.

**Async patterns:** the only fire-and-forget call is the admin SMS notification at `src/app/api/intake/route.ts` (lines 618-623). Everything else, including three sequential Zoho calls and an email send, runs synchronously inside the intake request. Rate limiting is file-based per process, and chat limits are in-memory maps, so neither survives a restart or works across replicas.

---

## Third parties that could see request data

| Service | Where | What it receives | Could see bodies, IDs, or uploads? |
|---|---|---|---|
| Twilio Verify and Messaging | `src/lib/twilio.ts` | Patient phone numbers; admin alert SMS containing patient name and phone; free-text SMS from admins to patients via `src/app/api/admin/sms/send/route.ts` | Phone numbers and any message text |
| Resend | `src/lib/email.ts` | Setup and reset links; contact notifications; a weight-assessment email with name, age, height, weight, BMI, and eligible medications, plus a link to calculator.net with those values in the query string | Health data in email bodies; calculator.net gets it in a URL |
| Zoho CRM | `src/lib/zoho.ts` | Full intake including name, DOB, phone, state, and the complete `healthSummary` text as a contact description, lead description, and note | The full health questionnaire |
| Anthropic | `src/app/api/chat/route.ts` | Anonymous visitor chat messages | Free text; no auth context is attached |
| Asher Med API | `src/lib/asher.ts` | Admin-triggered order creation sends name, email, phone, DOB, gender, and intake answers; sync pulls all partner patients | Yes, by design |
| ip-api.com | `src/lib/audit.ts` (line 87) | Client IP over plain HTTP on every audit event | IP only, but unencrypted and a free non-commercial tier |
| GA4, GTM, Google Ads, Meta Pixel, TikTok Pixel, Bing UET, arbitrary custom scripts | `src/components/tracking/TrackingScripts.tsx` | Pageviews on every route including the portal and admin, when enabled in the admin tracking settings | Page URLs. The `headScripts` and `bodyScripts` fields inject unreviewed HTML site-wide, so any session-replay tool could be added without a code change |
| Instagram and Facebook CDN | `src/lib/instagram.ts`, `next.config.ts` | Access token in a query string; image fetches | Outbound only |

**Error tracking, session replay, log shipping:** not present in code. No Sentry, PostHog, LogRocket, Hotjar, Datadog, or similar. Whether the tracking config file on the live volume already contains custom scripts is not visible in the repo. The `trackLead` and `trackContact` helpers that would send email and phone to ad pixels are defined but have no callers.

**Log redaction:** a `sanitizeForLogging` helper exists in `src/lib/api-utils.ts` (line 49) but nothing calls it. Server logs, which go to Railway's log drain, currently include:
- the full intake contact info and complete health summary at `src/app/api/intake/route.ts` (lines 138-343)
- the full Zoho contact payload at `src/lib/zoho.ts` (line 374)
- the full note content at `src/lib/zoho.ts` (lines 429-430)
- support-message metadata with user email at `src/app/api/support/route.ts` (line 47)

Chat prompts and responses are stored in the audit log table.

---

## Legal surface

Both pages are static React, last updated "February 2025".

**`src/app/privacy/page.tsx`**

Collects: "Name, Email address, Phone number, Date of birth, Health information you choose to provide, Mailing address" plus IP, browser, and pages viewed.

On sharing: "We may share your information with third-party vendors who perform services on our behalf, such as payment processing, email delivery, and hosting services."

On health data: "If you provide health information through our services, that information may be protected by the Health Insurance Portability and Accountability Act (HIPAA). Medical services are provided by independent licensed medical providers, and your protected health information (PHI) is handled in accordance with applicable healthcare privacy laws. For more information about how your PHI is handled, please refer to the Notice of Privacy Practices provided by your healthcare provider."

Use includes: "Improve our website and services."

**Not present in either document:** any mention of photos, images, or biometric data; any retention period; any consent for using customer data for product improvement or model training; any list of named subprocessors.

**`src/app/terms/page.tsx`** states "MeltAwayMD and Asher Med do not practice medicine" and has no photo or image clauses.

There is no separate consent page. The only consent capture in code is the SMS consent checkbox on intake and contact forms. `docs/updates/2026_04_10.md` lists a planned "Before & After Gallery" of clinical photos with a note about HIPAA and consent, which is directly adjacent to the proposed feature.

---

## Things that could not be determined from the code

1. Whether Railway actually has a persistent volume at `/app/data`. If not, admin-entered API keys, Zoho tokens, tracking config, and the intake JSON fallback vanish on every deploy, and the branding directory is never persisted regardless.
2. Whether a BAA exists with Railway, Twilio, Resend, Zoho, and Anthropic, and whether the Railway Postgres is encrypted at rest and backed up. None of this is inferable from the repo.
3. What is currently in the live tracking config, especially the custom script fields, since that determines whether a replay tool is already running on portal pages.
4. Whether admin accounts are shared among staff or one per person, and whether any non-admin staff role is expected. The code has no middle tier.
5. Whether the branding and Instagram routes are ever called from the live admin UI, or whether the `public/branding` uploads are dead code. Both are tracked in git, which suggests uploads happened locally and were committed.

---

## Problems if this app starts handling PHI

- **Tracked sensitive files in git.** `cookies.txt` is a curl cookie jar containing localhost NextAuth CSRF and callback cookie values. `prisma/dev.db` is a real SQLite database with User, AuditLog, and SmsConsent tables and roughly 15 email-like strings. Five Railway deploy logs are tracked under `railwaylogs/`; they contain no emails or phones by pattern scan but do reference tokens. `AsherMed/prescriptions.jpg` is a product catalog screenshot, not PHI.
- **Health data in stdout logs.** The intake route and Zoho client log full questionnaires and names by design. Railway retains these, and anyone with Railway project access can read them. This is the single largest current leak path.
- **Zoho and Resend receive complete health summaries** in free-text description fields and email bodies. The weight-assessment email additionally puts age, sex, height, and weight into a third-party calculator URL.
- **No column encryption, and the one encryption key is the session secret.** `totpSecret` is plaintext. A body-photo feature would have nowhere to put a data-encryption key without changing the key management model.
- **File storage has no home.** Both existing upload paths write to the container filesystem or to a Postgres `Bytes` column served through an unauthenticated public route with a day-long cache header. Neither is an acceptable pattern for patient photos.
- **Patient-side authorization pattern is missing.** No API today returns a patient-owned record to a patient except support messages. Any photo endpoint would be building owner scoping from scratch, and the portal layout only checks that a session exists, not the role.
- **Session and OTP weaknesses.** Patient sessions last 30 days and are minted outside NextAuth's normal flow. The `verify-code` route has no rate limit, so a six-digit code can be brute-forced within Twilio's own attempt cap. The `send-code` login path matches users on the last ten digits of the phone with `contains`.
- **Tracking scripts load on the portal and admin.** Ad pixels see every authenticated URL, and the custom-script fields allow arbitrary third-party JavaScript on pages that would display photos. Photo URLs containing patient or record IDs would flow to those vendors.
- **No background processing.** Image resizing, EXIF stripping, virus scanning, or delayed deletion would have to run inside the request, in a single 512 MB container.
- **Retention is not enforced.** Audit cleanup exists but never runs. There is no retention logic for questionnaires, notes, or the planned photos, and the privacy policy promises none.
- **The privacy policy does not cover photos or biometrics** and names only generic vendor categories. Adding body photos would require a policy update and an explicit consent flow that does not exist in code.
