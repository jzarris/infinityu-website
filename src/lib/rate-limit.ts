import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const RATE_LIMIT_DIR = path.join(process.cwd(), 'data', 'rate-limits');

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  name: string;
}

function getFilePath(name: string): string {
  return path.join(RATE_LIMIT_DIR, `${name}.json`);
}

async function loadStore(name: string): Promise<RateLimitStore> {
  try {
    const data = await readFile(getFilePath(name), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveStore(name: string, store: RateLimitStore): Promise<void> {
  await mkdir(RATE_LIMIT_DIR, { recursive: true });
  await writeFile(getFilePath(name), JSON.stringify(store, null, 2));
}

function cleanupExpired(store: RateLimitStore, windowMs: number): RateLimitStore {
  const now = Date.now();
  const cleaned: RateLimitStore = {};
  for (const [key, entry] of Object.entries(store)) {
    if (now - entry.windowStart < windowMs) {
      cleaned[key] = entry;
    }
  }
  return cleaned;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs, name } = config;
  const now = Date.now();

  let store = await loadStore(name);
  store = cleanupExpired(store, windowMs);

  let entry = store[identifier];

  if (!entry || now - entry.windowStart >= windowMs) {
    entry = { count: 1, windowStart: now };
    store[identifier] = entry;
    await saveStore(name, store);
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    const resetAt = entry.windowStart + windowMs;
    const retryAfter = Math.ceil((resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetAt, retryAfter };
  }

  entry.count++;
  store[identifier] = entry;
  await saveStore(name, store);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.windowStart + windowMs };
}

export async function resetRateLimit(identifier: string, name: string): Promise<void> {
  const store = await loadStore(name);
  delete store[identifier];
  await saveStore(name, store);
}

export const rateLimiters = {
  api: (identifier: string) =>
    checkRateLimit(identifier, { name: 'api', limit: 100, windowMs: 60 * 1000 }),
  auth: (identifier: string) =>
    checkRateLimit(identifier, { name: 'auth', limit: 5, windowMs: 15 * 60 * 1000 }),
  contact: (identifier: string) =>
    checkRateLimit(identifier, { name: 'contact', limit: 3, windowMs: 60 * 60 * 1000 }),
  intake: (identifier: string) =>
    checkRateLimit(identifier, { name: 'intake', limit: 5, windowMs: 24 * 60 * 60 * 1000 }),
};

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;
  return '127.0.0.1';
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter: result.retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  );
}
