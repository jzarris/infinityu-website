/**
 * Database-backed rate limiting for security-sensitive endpoints (OTP send and
 * verify). Unlike lib/rate-limit.ts (file-based, per process) this survives
 * restarts and works across replicas. Keys are hashed so phone numbers and
 * user ids are not stored in the bucket table.
 */

import { createHash } from 'crypto';
import { prisma } from './prisma';

export interface DbRateLimitOptions {
  limit: number;
  windowMs: number;
  /** When the limit is hit, lock the key for this long (optional). */
  lockoutMs?: number;
}

export interface DbRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  locked: boolean;
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export async function checkDbRateLimit(
  rawKey: string,
  opts: DbRateLimitOptions
): Promise<DbRateLimitResult> {
  const key = hashKey(rawKey);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const row = await tx.rateLimitBucket.findUnique({ where: { key } });

    if (row?.lockedUntil && row.lockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.ceil((row.lockedUntil.getTime() - now.getTime()) / 1000),
        locked: true,
      };
    }

    if (!row || now.getTime() - row.windowStart.getTime() >= opts.windowMs) {
      await tx.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now, lockedUntil: null },
      });
      return { allowed: true, remaining: opts.limit - 1, retryAfterSec: 0, locked: false };
    }

    if (row.count >= opts.limit) {
      const lockedUntil = opts.lockoutMs ? new Date(now.getTime() + opts.lockoutMs) : null;
      if (lockedUntil) {
        await tx.rateLimitBucket.update({ where: { key }, data: { lockedUntil } });
      }
      const resetAt = lockedUntil?.getTime() ?? row.windowStart.getTime() + opts.windowMs;
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000)),
        locked: !!lockedUntil,
      };
    }

    await tx.rateLimitBucket.update({ where: { key }, data: { count: row.count + 1 } });
    return { allowed: true, remaining: opts.limit - row.count - 1, retryAfterSec: 0, locked: false };
  });
}

/** Combine several limits; the first that refuses wins. */
export async function checkAll(
  checks: Array<[string, DbRateLimitOptions]>
): Promise<DbRateLimitResult> {
  let last: DbRateLimitResult = { allowed: true, remaining: 0, retryAfterSec: 0, locked: false };
  for (const [key, opts] of checks) {
    last = await checkDbRateLimit(key, opts);
    if (!last.allowed) return last;
  }
  return last;
}

export const OTP_LIMITS = {
  /** Wrong-or-right code attempts per phone: 5 per 15 min, then a 30 min lock. */
  verifyPerPhone: { limit: 5, windowMs: 15 * 60 * 1000, lockoutMs: 30 * 60 * 1000 },
  verifyPerIp: { limit: 20, windowMs: 15 * 60 * 1000 },
  /** Code sends per phone: 3 per 15 min, then a 60 min lock. */
  sendPerPhone: { limit: 3, windowMs: 15 * 60 * 1000, lockoutMs: 60 * 60 * 1000 },
  sendPerIp: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;

export function normalizePhoneKey(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function otpVerifyChecks(phoneOrId: string, ip: string): Array<[string, DbRateLimitOptions]> {
  return [
    [`otp-verify:id:${phoneOrId}`, OTP_LIMITS.verifyPerPhone],
    [`otp-verify:ip:${ip}`, OTP_LIMITS.verifyPerIp],
  ];
}

export function otpSendChecks(phone: string, ip: string): Array<[string, DbRateLimitOptions]> {
  return [
    [`otp-send:phone:${normalizePhoneKey(phone)}`, OTP_LIMITS.sendPerPhone],
    [`otp-send:ip:${ip}`, OTP_LIMITS.sendPerIp],
  ];
}

/** Support tool: clear every OTP bucket for a phone number (send and verify). */
export async function unlockPhone(phone: string): Promise<number> {
  const id = normalizePhoneKey(phone);
  const keys = [`otp-verify:id:${id}`, `otp-send:phone:${id}`].map(hashKey);
  const result = await prisma.rateLimitBucket.deleteMany({ where: { key: { in: keys } } });
  return result.count;
}

export function dbRateLimitResponse(result: DbRateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: result.locked
        ? 'Too many attempts. This number is temporarily locked. Please try again later.'
        : 'Too many attempts. Please wait and try again.',
      retryAfter: result.retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSec || 60),
      },
    }
  );
}
