# Website Admin Panel — Implementation Guide

> Reusable blueprint for adding an admin panel to Next.js websites.
> Originally built for InfinityU, designed to be replicated across projects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Auth | NextAuth v5 (beta) with CredentialsProvider, JWT strategy |
| 2FA | TOTP (RFC 6238) — custom implementation, no external library |
| Database | PostgreSQL via Prisma ORM |
| Passwords | bcryptjs (cost factor 12) |
| Settings | File-based (`data/config/settings.json`) with AES-256-GCM encryption for API keys |
| Styling | Tailwind CSS with hardcoded admin colors (not site theme) |

## Architecture Overview

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                    # Root admin layout (passthrough)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                # Auth layout (no session required)
│   │   │   └── login/page.tsx            # Login page with 2FA step
│   │   └── (protected)/
│   │       ├── layout.tsx                # Session guard + AdminNav sidebar
│   │       ├── page.tsx                  # Dashboard
│   │       ├── setup/page.tsx            # API keys & integrations
│   │       ├── security/page.tsx         # Password & 2FA management
│   │       ├── audit-log/page.tsx        # Security event log
│   │       ├── sms-consents/page.tsx     # TCPA-compliant consent records
│   │       └── seo/page.tsx              # SEO management (placeholder)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts    # NextAuth route handler
│       │   ├── check-credentials/route.ts # Pre-flight credential check
│       │   ├── log-event/route.ts        # Client-side audit logging
│       │   └── trust-browser/route.ts    # Trusted browser registration
│       └── admin/
│           ├── settings/route.ts         # GET (masked) / POST settings
│           ├── security/
│           │   ├── status/route.ts       # Password & 2FA status
│           │   ├── password/route.ts     # Password change
│           │   └── totp/
│           │       ├── setup/route.ts    # Generate TOTP secret + QR URI
│           │       ├── verify/route.ts   # Verify code & enable 2FA
│           │       └── disable/route.ts  # Disable 2FA
│           ├── audit-log/route.ts        # Paginated log with CSV export
│           ├── sms-consents/route.ts     # Paginated consents with CSV export
│           └── test-integration/route.ts # Test API key connectivity
├── components/
│   └── admin/
│       └── AdminNav.tsx                  # Sidebar (collapsible desktop, drawer mobile)
└── lib/
    ├── auth.ts                           # NextAuth config + requireAdmin() helper
    ├── prisma.ts                         # Singleton PrismaClient
    ├── totp.ts                           # TOTP generate/verify (RFC 6238)
    ├── audit.ts                          # Audit logging + IP geolocation
    ├── trustedBrowser.ts                 # 30-day trusted device tokens
    └── settings.ts                       # File-based settings CRUD
```

## Database Schema (Prisma)

### Required Models

```prisma
model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  emailVerified   DateTime?
  image           String?
  role            String    @default("user")
  password        String?
  totpSecret      String?
  totpEnabled     Boolean   @default(false)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  accounts        Account[]
  sessions        Session[]
  trustedBrowsers TrustedBrowser[]
}

model AuditLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  action    String                    // login_success, login_failed, password_change, etc.
  actor     String                    // email or "system"
  actorId   String?
  actorRole String?
  target    String?
  targetId  String?
  ipAddress String?
  country   String?
  userAgent String?
  details   String?                   // JSON string for extra context
  success   Boolean  @default(true)
  expiresAt DateTime                  // 90 days from creation (auto-cleanup)

  @@index([timestamp])
  @@index([action])
  @@index([actor])
  @@index([expiresAt])
}

model SmsConsent {
  id          String   @id @default(cuid())
  email       String
  phone       String
  firstName   String
  lastName    String
  consentType String                  // "transactional" or "marketing"
  consented   Boolean
  ipAddress   String?
  userAgent   String?
  source      String   @default("contact_form")
  consentText String                  // Exact legal text shown at consent time
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([createdAt])
}

model TrustedBrowser {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique         // SHA256 of random token
  userAgent String?
  ipAddress String?
  lastUsed  DateTime @default(now())
  expiresAt DateTime                  // 30 days from creation
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
}
```

Also include standard NextAuth models: `Account`, `Session`, `VerificationToken`.

## Authentication Flow

1. **Login page** (`/admin/login`) — email + password form
2. **Pre-flight check** (`POST /api/auth/check-credentials`) — validates credentials, returns whether TOTP is required, checks for trusted browser cookie
3. **2FA step** — if TOTP enabled and browser not trusted, show 6-digit code input + "Remember this browser" checkbox
4. **NextAuth sign-in** — CredentialsProvider `authorize()` verifies password + optional TOTP code
5. **Post-login** — client calls `/api/auth/log-event` (audit) and optionally `/api/auth/trust-browser` (sets `HttpOnly` cookie, 30-day TTL)
6. **Session** — JWT strategy, 24h max age, 1h refresh interval

### Key auth.ts Config

```typescript
// JWT strategy (no database sessions needed for admin)
session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },

// Custom pages
pages: { signIn: '/admin/login' },

// requireAdmin() helper for API routes
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== 'admin') {
    return null;
  }
  return session;
}
```

## TOTP 2FA Implementation

Custom RFC 6238 implementation in `src/lib/totp.ts`:

- **No external library** — uses Node.js `crypto` for HMAC-SHA1
- **Base32 encoding** per RFC 4648
- **30-second time steps** with ±1 period drift tolerance
- **QR code** generated via `qrcode.react` on the client
- **Issuer format**: `"SiteName Admin"` (e.g., "InfinityU Admin")

### Setup flow:
1. `POST /api/admin/security/totp/setup` → generates secret, returns `otpauthUri`
2. Client renders QR code from URI
3. User scans with Google Authenticator / Authy
4. `POST /api/admin/security/totp/verify` with 6-digit code → enables 2FA

## Audit Logging

- **90-day retention** — `expiresAt` set on creation, cleanup on each new log entry
- **IP geolocation** — uses `ip-api.com` free tier with 24h in-memory cache
- **Actions tracked**: `login_success`, `login_failed`, `logout`, `password_change`, `totp_enabled`, `totp_disabled`, `settings_updated`, `settings_removed`
- **CSV export** — `GET /api/admin/audit-log?export=csv`

## Settings Storage

File-based at `data/config/settings.json` (gitignored):

```typescript
interface Settings {
  anthropicApiKey?: string;    // Claude AI key
  resendApiKey?: string;       // Email service key
  instagramApiKey?: string;    // Instagram Graph API key
  instagramPostUrls?: string[]; // Instagram embed URLs
  contactEmail?: string;       // Contact form notification email
}
```

- **API keys encrypted** with AES-256-GCM using `NEXTAUTH_SECRET` as encryption key
- **GET endpoint** returns masked values (e.g., `re_...8Lo`)
- **POST endpoint** saves new values or removes keys (pass `null` to delete)
- **Test endpoint** validates API key connectivity before saving

## SMS Consent (TCPA Compliance)

Contact form includes two consent checkboxes:

1. **Transactional** (default checked) — appointment reminders, confirmations
2. **Marketing** (default unchecked) — promotions, newsletters

Records are **immutable** — never update, only create new entries. Each record stores:
- Exact consent text shown to user
- IP address and user agent (proof of consent)
- Timestamp
- Source (e.g., "contact_form")

## Middleware (Security Headers)

`src/middleware.ts` adds:
- **CSP** — restricts script/style/connect sources
- **X-Frame-Options: DENY** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **HSTS** — production only, 1-year max-age with preload
- **Referrer-Policy** — strict-origin-when-cross-origin
- **Permissions-Policy** — disables camera, microphone, geolocation
- **Domain redirect** — non-www to www (production)

## Seed Script

`prisma/seed.ts` creates the initial admin user:

```bash
npm run db:push      # Create tables
npm run db:seed      # Create admin user
```

Run via: `npx tsx prisma/seed.ts`

## Environment Variables

```env
# .env (Prisma CLI only)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"

# .env.local (runtime secrets — gitignored)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
NEXTAUTH_SECRET="random-64-char-string"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
RESEND_API_KEY="re_..."
CONTACT_EMAIL="contact@yourdomain.com"
```

## Replication Checklist

When adding this admin panel to a new website:

1. **Copy files**: All files listed in the Architecture Overview above
2. **Install dependencies**: `@auth/prisma-adapter`, `@prisma/client`, `bcryptjs`, `next-auth@beta`, `qrcode.react`, `react-hook-form`, `@hookform/resolvers`, `zod`; dev: `prisma`, `tsx`, `@types/bcryptjs`
3. **Update Prisma schema**: Add all models from Database Schema section
4. **Update seed script**: Change admin email, password, and site name
5. **Update constants**: Change TOTP issuer name in `totp.ts`, cookie name in `trustedBrowser.ts`, domain in `middleware.ts`
6. **Update admin styling**: Login page and AdminNav use hardcoded brand colors (not CSS variables) — update hex values
7. **Set environment variables**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
8. **Run database setup**: `npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts`
9. **First login**: Use seeded credentials, then immediately enable 2FA in Security settings
10. **Update CSP**: Add any external API domains to `connect-src` in middleware

## Admin Panel Sections

| Section | Route | Purpose |
|---------|-------|---------|
| Dashboard | `/admin` | Quick links to all sections |
| Setup | `/admin/setup` | API keys, Instagram URLs, contact email |
| Security | `/admin/security` | Password change, 2FA enable/disable |
| Audit Log | `/admin/audit-log` | Security event history with filters & CSV export |
| SMS Consents | `/admin/sms-consents` | TCPA-compliant consent records |
| SEO | `/admin/seo` | SEO management (placeholder) |
