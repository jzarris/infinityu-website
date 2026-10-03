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
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Identifier for this rate limiter (creates separate files) */
  name: string;
}

/**
 * Gets the file path for a specific rate limiter
 */
function getFilePath(name: string): string {
  return path.join(RATE_LIMIT_DIR, `${name}.json`);
}

/**
 * Loads rate limit data from file
 */
async function loadStore(name: string): Promise<RateLimitStore> {
  try {
    const data = await readFile(getFilePath(name), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Saves rate limit data to file
 */
async function saveStore(name: string, store: RateLimitStore): Promise<void> {
  await mkdir(RATE_LIMIT_DIR, { recursive: true });
  await writeFile(getFilePath(name), JSON.stringify(store, null, 2));
}

/**
 * Cleans up expired entries from the store
 */
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

/**
 * Check and consume rate limit for a given identifier
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs, name } = config;
  const now = Date.now();

  // Load and clean store
  let store = await loadStore(name);
  store = cleanupExpired(store, windowMs);

  // Get or create entry for this identifier
  let entry = store[identifier];

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a new window
    entry = {
      count: 1,
      windowStart: now,
    };
    store[identifier] = entry;
    await saveStore(name, store);

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    const resetAt = entry.windowStart + windowMs;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  store[identifier] = entry;
  await saveStore(name, store);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}

/**
 * Resets rate limit for a given identifier
 */
export async function resetRateLimit(identifier: string, name: string): Promise<void> {
  const store = await loadStore(name);
  delete store[identifier];
  await saveStore(name, store);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * API rate limiter: 100 requests per minute
   */
  api: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'api',
      limit: 100,
      windowMs: 60 * 1000,
    }),

  /**
   * Auth rate limiter: 5 attempts per 15 minutes
   */
  auth: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'auth',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    }),

  /**
   * Contact form rate limiter: 3 submissions per hour
   */
  contact: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'contact',
      limit: 3,
      windowMs: 60 * 60 * 1000,
    }),

  /**
   * Intake form rate limiter: 5 submissions per day
   */
  intake: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'intake',
      limit: 5,
      windowMs: 24 * 60 * 60 * 1000,
    }),

  /**
   * Chat rate limiter: 10 messages per minute, 50 per day
   */
  chatMinute: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'chat-minute',
      limit: 10,
      windowMs: 60 * 1000,
    }),

  chatDaily: (identifier: string) =>
    checkRateLimit(identifier, {
      name: 'chat-daily',
      limit: 50,
      windowMs: 24 * 60 * 60 * 1000,
    }),
};

/**
 * Extracts client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIP(request: Request): string {
  // Try various headers that may contain the client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the list (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Helper to create rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
    }),
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
