import { prisma } from '@/lib/prisma';

const RETENTION_DAYS = 90;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type AuditAction =
  | 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access'
  | 'password_change' | 'password_set' | 'totp_enabled' | 'totp_disabled'
  | 'setting_updated' | 'setting_removed'
  | 'trusted_browser_added' | 'trusted_browser_revoked'
  | 'user_created' | 'user_updated' | 'user_deleted'
  | 'contact_form_submitted';

export interface AuditLogEntry {
  action: AuditAction;
  actor?: string;
  actorId?: string;
  actorRole?: 'admin' | null;
  target?: string;
  targetId?: string;
  ipAddress?: string;
  country?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  success?: boolean;
}

const geoCache = new Map<string, { country: string; timestamp: number }>();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getCountryFromIP(ipAddress: string): Promise<string | null> {
  if (['127.0.0.1', 'localhost', 'unknown'].includes(ipAddress) ||
      ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.16.')) {
    return null;
  }
  const cached = geoCache.get(ipAddress);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) return cached.country;
  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,countryCode`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 'success' && data.countryCode) {
      geoCache.set(ipAddress, { country: data.countryCode, timestamp: Date.now() });
      return data.countryCode;
    }
    return null;
  } catch { return null; }
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RETENTION_MS);
    let country = entry.country || null;
    if (!country && entry.ipAddress) country = await getCountryFromIP(entry.ipAddress);
    await prisma.auditLog.create({
      data: {
        timestamp: now,
        action: entry.action,
        actor: entry.actor || null,
        actorId: entry.actorId || null,
        actorRole: entry.actorRole || null,
        target: entry.target || null,
        targetId: entry.targetId || null,
        ipAddress: entry.ipAddress || null,
        country,
        userAgent: entry.userAgent || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        success: entry.success ?? true,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
  }
}

export async function cleanupExpiredAuditLogs(): Promise<number> {
  try {
    const result = await prisma.auditLog.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired audit logs:', error);
    return 0;
  }
}

export function getRequestInfo(request: Request): { ipAddress: string; userAgent: string | undefined } {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  let ipAddress = '127.0.0.1';
  if (forwardedFor) ipAddress = forwardedFor.split(',')[0].trim();
  else if (realIP) ipAddress = realIP;
  else if (cfConnectingIP) ipAddress = cfConnectingIP;
  const userAgent = request.headers.get('user-agent') || undefined;
  return { ipAddress, userAgent };
}
