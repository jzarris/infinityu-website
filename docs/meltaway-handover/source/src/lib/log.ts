/**
 * Application logging with personal-data redaction.
 *
 * Rules: log ids, counts, timings, and codes. Never log request bodies,
 * database rows containing patient fields, or free text from users. This
 * module redacts common identifiers from anything that does get through, but
 * redaction is a backstop, not a license.
 */

const MAX_STRING = 300;
const MAX_KEYS = 30;
const MAX_ITEMS = 20;

/**
 * Masks emails, phone numbers, SSN-like and card-like digit runs in a string.
 */
export function sanitizeForLogging(text: string): string {
  return text
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[EMAIL]')
    .replace(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '[PHONE]')
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, '[SSN]')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]');
}

export function redact(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') return sanitizeForLogging(value).slice(0, MAX_STRING);
  if (value instanceof Error) {
    return { name: value.name, message: sanitizeForLogging(value.message).slice(0, MAX_STRING) };
  }
  if (depth > 3) return '[depth]';
  if (Array.isArray(value)) return value.slice(0, MAX_ITEMS).map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
      out[k] = redact(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

type Meta = Record<string, unknown>;

function emit(level: 'info' | 'warn' | 'error', scope: string, message: string, meta?: Meta) {
  const line = `[${scope}] ${sanitizeForLogging(message)}`;
  const payload = meta ? JSON.stringify(redact(meta)) : '';
  if (level === 'error') console.error(line, payload);
  else if (level === 'warn') console.warn(line, payload);
  else console.log(line, payload);
}

export function createLogger(scope: string) {
  return {
    info: (message: string, meta?: Meta) => emit('info', scope, message, meta),
    warn: (message: string, meta?: Meta) => emit('warn', scope, message, meta),
    error: (message: string, meta?: Meta) => emit('error', scope, message, meta),
  };
}

export type Logger = ReturnType<typeof createLogger>;
