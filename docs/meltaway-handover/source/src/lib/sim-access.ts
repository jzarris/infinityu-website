/**
 * Short-lived, purpose-bound access token for the simulator, issued when intake
 * phone verification succeeds and carried in an httpOnly cookie. It lets a
 * person who is not yet a patient (no session) use the simulator without ever
 * putting an identifier in a URL. Pure token functions are separated so they
 * can be unit tested.
 */

import { createHmac, timingSafeEqual } from 'crypto';

export const SIM_ACCESS_COOKIE = 'sim_access';
// Long enough to leave, get the "ready" text, and come back on the same phone
// without signing in. It grants access to the simulator only.
export const SIM_ACCESS_TTL_MS = 24 * 60 * 60 * 1000;
const PURPOSE = 'simulator';

interface Payload {
  uid: string;
  exp: number;
  p: string;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueSimAccessToken(userId: string, secret: string, now = Date.now()): string {
  const payload: Payload = { uid: userId, exp: now + SIM_ACCESS_TTL_MS, p: PURPOSE };
  const encoded = b64url(Buffer.from(JSON.stringify(payload)));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySimAccessToken(
  token: string | undefined | null,
  secret: string,
  now = Date.now()
): { userId: string } | null {
  if (!token) return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(encoded, secret);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  let payload: Payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (payload.p !== PURPOSE || typeof payload.uid !== 'string' || typeof payload.exp !== 'number') return null;
  if (payload.exp <= now) return null;
  return { userId: payload.uid };
}

export function simAccessCookieOptions(now = Date.now()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(now + SIM_ACCESS_TTL_MS),
  };
}
