#!/bin/sh
set -e
# Apply schema changes at startup without Prisma CLI.
# Uses CREATE TABLE IF NOT EXISTS and ALTER TABLE ADD COLUMN IF NOT EXISTS
# so every statement is safe to re-run on every deploy.
node -e "
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function migrate() {
  // ── Setting (original) ──────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"Setting\" (
      \"key\"       TEXT         PRIMARY KEY,
      \"value\"     TEXT         NOT NULL,
      \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  \`);

  // ── AuditLog ────────────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"AuditLog\" (
      \"id\"        TEXT         PRIMARY KEY,
      \"timestamp\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"action\"    TEXT         NOT NULL,
      \"actor\"     TEXT,
      \"actorId\"   TEXT,
      \"actorRole\" TEXT,
      \"target\"    TEXT,
      \"targetId\"  TEXT,
      \"ipAddress\" TEXT,
      \"country\"   TEXT,
      \"userAgent\" TEXT,
      \"details\"   TEXT,
      \"success\"   BOOLEAN      NOT NULL DEFAULT true,
      \"expiresAt\" TIMESTAMP(3) NOT NULL
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"AuditLog_timestamp_idx\" ON \"AuditLog\"(\"timestamp\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"AuditLog_action_idx\"    ON \"AuditLog\"(\"action\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"AuditLog_actor_idx\"     ON \"AuditLog\"(\"actor\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"AuditLog_expiresAt_idx\" ON \"AuditLog\"(\"expiresAt\")\`);

  // ── SmsConsent ──────────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"SmsConsent\" (
      \"id\"          TEXT         PRIMARY KEY,
      \"email\"       TEXT         NOT NULL,
      \"phone\"       TEXT,
      \"firstName\"   TEXT,
      \"lastName\"    TEXT,
      \"consentType\" TEXT         NOT NULL,
      \"consented\"   BOOLEAN      NOT NULL,
      \"ipAddress\"   TEXT,
      \"userAgent\"   TEXT,
      \"source\"      TEXT         NOT NULL,
      \"consentText\" TEXT         NOT NULL,
      \"createdAt\"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"updatedAt\"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"SmsConsent_email_idx\"     ON \"SmsConsent\"(\"email\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"SmsConsent_createdAt_idx\" ON \"SmsConsent\"(\"createdAt\")\`);

  // ── User — new columns added with intake-simulator ──────────────────────
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"phone\"         TEXT\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"phoneVerified\" BOOLEAN NOT NULL DEFAULT false\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"dateOfBirth\"   TEXT\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"isPatient\"     BOOLEAN NOT NULL DEFAULT false\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"totpSecret\"    TEXT\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"totpEnabled\"   BOOLEAN NOT NULL DEFAULT false\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"isActive\"      BOOLEAN NOT NULL DEFAULT true\`);
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"password\"      TEXT\`);

  // ── RateLimitBucket ─────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"RateLimitBucket\" (
      \"key\"         TEXT         PRIMARY KEY,
      \"count\"       INTEGER      NOT NULL DEFAULT 0,
      \"windowStart\" TIMESTAMP(3) NOT NULL,
      \"lockedUntil\" TIMESTAMP(3),
      \"updatedAt\"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"RateLimitBucket_windowStart_idx\" ON \"RateLimitBucket\"(\"windowStart\")\`);

  // ── QuestionnaireSubmission ─────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"QuestionnaireSubmission\" (
      \"id\"                 TEXT         PRIMARY KEY,
      \"userId\"             TEXT,
      \"email\"              TEXT         NOT NULL,
      \"firstName\"          TEXT         NOT NULL,
      \"lastName\"           TEXT         NOT NULL,
      \"phone\"              TEXT         NOT NULL,
      \"dateOfBirth\"        TEXT         NOT NULL,
      \"state\"              TEXT         NOT NULL,
      \"biologicalSex\"      TEXT,
      \"selectedGoals\"      TEXT         NOT NULL,
      \"answers\"            TEXT         NOT NULL,
      \"eligibleProducts\"   TEXT         NOT NULL,
      \"ineligibleProducts\" TEXT         NOT NULL,
      \"healthSummary\"      TEXT,
      \"acknowledgments\"    TEXT,
      \"submissionLanguage\" TEXT         NOT NULL DEFAULT 'en',
      \"languagesUsed\"      TEXT         NOT NULL DEFAULT '[\"en\"]',
      \"ipAddress\"          TEXT,
      \"userAgent\"          TEXT,
      \"submittedAt\"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"QuestionnaireSubmission_userId_idx\"      ON \"QuestionnaireSubmission\"(\"userId\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"QuestionnaireSubmission_email_idx\"       ON \"QuestionnaireSubmission\"(\"email\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"QuestionnaireSubmission_submittedAt_idx\" ON \"QuestionnaireSubmission\"(\"submittedAt\")\`);
  // Column added after initial table creation — safe no-op if already present
  await prisma.\$executeRawUnsafe(\`ALTER TABLE \"QuestionnaireSubmission\" ADD COLUMN IF NOT EXISTS \"acknowledgments\" TEXT\`);

  // ── PhotoConsent ────────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"PhotoConsent\" (
      \"id\"          TEXT         PRIMARY KEY,
      \"userId\"      TEXT         NOT NULL,
      \"version\"     TEXT         NOT NULL,
      \"textShown\"   TEXT         NOT NULL,
      \"purposes\"    TEXT         NOT NULL,
      \"ipAddress\"   TEXT,
      \"userAgent\"   TEXT,
      \"createdAt\"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"withdrawnAt\" TIMESTAMP(3)
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"PhotoConsent_userId_idx\" ON \"PhotoConsent\"(\"userId\")\`);

  // ── BodyPhoto ───────────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"BodyPhoto\" (
      \"id\"             TEXT         PRIMARY KEY,
      \"userId\"         TEXT         NOT NULL,
      \"consentId\"      TEXT         NOT NULL,
      \"storageKey\"     TEXT         NOT NULL UNIQUE,
      \"sha256\"         TEXT         NOT NULL,
      \"width\"          INTEGER      NOT NULL,
      \"height\"         INTEGER      NOT NULL,
      \"contentType\"    TEXT         NOT NULL DEFAULT 'image/jpeg',
      \"capturedAt\"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"retentionAt\"    TIMESTAMP(3) NOT NULL,
      \"deletedAt\"      TIMESTAMP(3),
      \"status\"         TEXT         NOT NULL DEFAULT 'accepted',
      \"refusalReasons\" TEXT
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"BodyPhoto_userId_idx\"      ON \"BodyPhoto\"(\"userId\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"BodyPhoto_retentionAt_idx\" ON \"BodyPhoto\"(\"retentionAt\")\`);

  // ── Simulation ──────────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"Simulation\" (
      \"id\"                    TEXT             PRIMARY KEY,
      \"photoId\"               TEXT             NOT NULL,
      \"userId\"                TEXT             NOT NULL,
      \"cohort\"                TEXT             NOT NULL,
      \"units\"                 TEXT             NOT NULL DEFAULT 'imperial',
      \"paramsMetric\"          TEXT             NOT NULL,
      \"paramsDisplay\"         TEXT             NOT NULL,
      \"goalWeightKgRequested\" DOUBLE PRECISION NOT NULL,
      \"goalWeightKgApplied\"   DOUBLE PRECISION NOT NULL,
      \"status\"                TEXT             NOT NULL DEFAULT 'pending',
      \"remoteCallId\"          TEXT,
      \"outputKeys\"            TEXT,
      \"diagnostics\"           TEXT,
      \"refusalReasons\"        TEXT,
      \"userMessage\"           TEXT,
      \"modelVersion\"          TEXT,
      \"configOverrides\"       TEXT,
      \"rerunOfId\"             TEXT,
      \"notifyRequested\"       BOOLEAN          NOT NULL DEFAULT false,
      \"notifiedAt\"            TIMESTAMP(3),
      \"createdAt\"             TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"completedAt\"           TIMESTAMP(3),
      \"deletedAt\"             TIMESTAMP(3)
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"Simulation_userId_idx\"    ON \"Simulation\"(\"userId\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"Simulation_photoId_idx\"   ON \"Simulation\"(\"photoId\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"Simulation_status_idx\"    ON \"Simulation\"(\"status\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"Simulation_createdAt_idx\" ON \"Simulation\"(\"createdAt\")\`);

  // ── TrustedBrowser ──────────────────────────────────────────────────────
  await prisma.\$executeRawUnsafe(\`
    CREATE TABLE IF NOT EXISTS \"TrustedBrowser\" (
      \"id\"        TEXT         PRIMARY KEY,
      \"userId\"    TEXT         NOT NULL,
      \"tokenHash\" TEXT         NOT NULL UNIQUE,
      \"userAgent\" TEXT,
      \"ipAddress\" TEXT,
      \"lastUsed\"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"expiresAt\" TIMESTAMP(3) NOT NULL,
      \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  \`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"TrustedBrowser_userId_idx\"    ON \"TrustedBrowser\"(\"userId\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"TrustedBrowser_tokenHash_idx\" ON \"TrustedBrowser\"(\"tokenHash\")\`);
  await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS \"TrustedBrowser_expiresAt_idx\" ON \"TrustedBrowser\"(\"expiresAt\")\`);
}

migrate()
  .then(() => {
    console.log('Database schema verified');
    return prisma.\$disconnect();
  })
  .catch(e => {
    console.error('Schema migration failed:', e.message);
    prisma.\$disconnect();
    process.exit(1);
  });
"

# Start the application
exec node server.js
