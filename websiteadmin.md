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
│   │       ├── setup/page.tsx            # API keys, integrations, branding
│   │       ├── security/page.tsx         # Password & 2FA management
│   │       ├── audit-log/page.tsx        # Security event log
│   │       ├── sms-consents/page.tsx     # TCPA-compliant consent records
│   │       ├── users/page.tsx            # User management (CRUD)
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
│           ├── branding/route.ts         # Logo & favicon upload/delete (protected)
│           ├── users/route.ts            # List & create users
│           ├── users/[userId]/route.ts   # Update & delete users
│           └── test-integration/route.ts # Test API key connectivity
│   ├── branding/route.ts                 # Public: get branding URLs
│   └── branding/[filename]/route.ts      # Public: serve branding files dynamically
├── components/
│   ├── admin/
│   │   └── AdminNav.tsx                  # Sidebar (collapsible desktop, drawer mobile)
│   ├── layout/
│   │   └── Header.tsx                    # Site header (loads dynamic logo from branding API)
│   └── providers/
│       └── FaviconProvider.tsx           # Client component: dynamic favicon injection
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
- **Actions tracked**: `login_success`, `login_failed`, `logout`, `password_change`, `totp_enabled`, `totp_disabled`, `settings_updated`, `settings_removed`, `user_created`, `user_updated`, `user_deleted`
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
| Setup | `/admin/setup` | API keys, Instagram URLs, contact email, branding (logo/favicon) |
| Security | `/admin/security` | Password change, 2FA enable/disable |
| Audit Log | `/admin/audit-log` | Security event history with filters & CSV export |
| SMS Consents | `/admin/sms-consents` | TCPA-compliant consent records |
| Users | `/admin/users` | User management (create, edit, deactivate, delete) |
| SEO | `/admin/seo` | SEO management (placeholder) |

## Branding (Logo & Favicon)

The Setup page includes a branding section for uploading a custom logo and favicon.

### How it works

- **Upload API** (`POST /api/admin/branding`) — accepts `multipart/form-data` with `file` and `type` (logo or favicon)
  - Logo: PNG, JPG, SVG, WebP — max 5MB
  - Favicon: PNG, ICO, SVG — max 1MB
- **Files stored** at `public/branding/` (e.g., `logo.png`, `favicon.ico`)
- **Config stored** at `data/config/branding.json` — maps type to filename
- **Public API** (`GET /api/branding`) — returns `{ logo: string | null, favicon: string | null }` URLs
- **Dynamic file serving** (`GET /branding/[filename]`) — required because Next.js standalone mode doesn't serve files added to `public/` after build time. This API route reads files from the filesystem and serves them with correct Content-Type and cache headers.

### Frontend integration

- **Header.tsx** — fetches `/api/branding` on mount, uses custom logo URL (falls back to static `/images/logo.png`)
- **FaviconProvider.tsx** — client component added to root layout, dynamically injects `<link rel="icon">` and `<link rel="apple-touch-icon">` tags

### Important: Ephemeral filesystem

On platforms with ephemeral filesystems (Railway, Heroku, Fly.io), uploaded branding files are lost on each deploy. For persistent storage, consider:
- S3/R2 bucket with presigned upload URLs
- Database blob storage
- Volume mounts (Railway volumes, Fly volumes)

## User Management

Admin users can be managed from `/admin/users`.

### Features

- **List users** — table showing name, email, role, active status, 2FA status, created date
- **Create user** — email, name, password (min 12 chars), role selection
- **Edit user** — inline edit name, email, role; toggle active status
- **Reset password** — set a new password for any user
- **Delete user** — with confirmation, prevents self-deletion
- **Audit logged** — all user CRUD actions are recorded (`user_created`, `user_updated`, `user_deleted`)

### API

- `GET /api/admin/users` — list all users
- `POST /api/admin/users` — create user (email, name, password, role)
- `PATCH /api/admin/users/[userId]` — update user fields
- `DELETE /api/admin/users/[userId]` — delete user (cannot delete self)

## Docker / Railway Deployment

### Dockerfile (multi-stage)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
RUN mkdir -p /app/data/config && chown -R nextjs:nodejs /app/data
RUN mkdir -p /app/public/branding && chown -R nextjs:nodejs /app/public/branding
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

### Key deployment notes

- **Prisma output** must be set to `../src/generated/prisma` in `schema.prisma` so the standalone build can trace and include the generated client
- **`serverExternalPackages`** in `next.config.ts` must include `['bcryptjs', '@prisma/client']`
- **Dummy DATABASE_URL** is required for `prisma generate` at build time (the real URL is only available at runtime)
- **NEXTAUTH_SECRET** must be a single line with no spaces or newlines — use `openssl rand -base64 32 | tr -d '\n'`
- **Database setup** after first deploy: `npx prisma db push` and `npx tsx prisma/seed.ts` (via Railway CLI with TCP proxy connection)

### Railway environment variables

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://postgres:pass@postgres.railway.internal:5432/railway` |
| `NEXTAUTH_SECRET` | Single-line base64 string |
| `NEXTAUTH_URL` | `https://yourdomain.up.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
