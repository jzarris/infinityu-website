import { prisma } from '@/lib/prisma';

// Retention period: 90 days in milliseconds
const RETENTION_DAYS = 90;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'unauthorized_access'
  | 'password_change'
  | 'password_set'
  | 'password_reset_requested'
  | 'password_setup_completed'
  | 'totp_enabled'
  | 'totp_disabled'
  | 'patient_created'
  | 'patient_updated'
  | 'patient_deleted'
  | 'patient_deactivated'
  | 'patient_reactivated'
  | 'setting_updated'
  | 'setting_removed'
  | 'settings_changed'
  | 'api_key_added'
  | 'api_key_removed'
  // Chat/AI events
  | 'chat_prompt'
  | 'chat_blocked'
  | 'chat_rate_limited'
  // Intake form events
  | 'intake_submitted'
  | 'intake_failed'
  // Admin management events
  | 'admin_created'
  | 'admin_updated'
  | 'admin_deactivated'
  | 'admin_deleted'
  // Trusted browser events
  | 'trusted_browser_added'
  | 'trusted_browser_revoked'
  // OTP abuse
  | 'otp_locked'
  // Simulator
  | 'simulation_created'
  | 'simulation_viewed'
  | 'simulation_deleted'
  | 'simulation_rerun'
  | 'photo_consent_given'
  | 'photo_consent_withdrawn'
  | 'photo_deleted';

export interface AuditLogEntry {
  action: AuditAction;
  actor?: string; // Email or identifier
  actorId?: string; // User ID
  actorRole?: 'admin' | 'patient' | null;
  target?: string; // What was affected
  targetId?: string; // ID of affected resource
  ipAddress?: string;
  country?: string; // Country code from IP geolocation
  userAgent?: string;
  details?: Record<string, unknown>; // Additional context
  success?: boolean;
}

// Simple in-memory cache for IP geolocation (to avoid repeated lookups)
const geoCache = new Map<string, { country: string; timestamp: number }>();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Look up country code from IP address using ip-api.com (free, no API key required)
 * Returns 2-letter country code or null if lookup fails
 */
async function getCountryFromIP(ipAddress: string): Promise<string | null> {
  // Skip lookup for localhost/private IPs
  if (
    ipAddress === '127.0.0.1' ||
    ipAddress === 'localhost' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.16.') ||
    ipAddress === 'unknown'
  ) {
    return null;
  }

  // Check cache first
  const cached = geoCache.get(ipAddress);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.country;
  }

  try {
    // ip-api.com is free for non-commercial use, 45 requests/minute limit
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,countryCode`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status === 'success' && data.countryCode) {
      // Cache the result
      geoCache.set(ipAddress, { country: data.countryCode, timestamp: Date.now() });
      return data.countryCode;
    }

    return null;
  } catch {
    // Silently fail - geolocation is not critical
    return null;
  }
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RETENTION_MS);

    // Look up country from IP (non-blocking, with fallback)
    let country = entry.country || null;
    if (!country && entry.ipAddress) {
      country = await getCountryFromIP(entry.ipAddress);
    }

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
    // Log to console but don't throw - audit logging should never break the app
    console.error('Failed to create audit log entry:', error);
  }
}

/**
 * Clean up expired audit logs (older than 90 days)
 * This should be called periodically (e.g., via cron job or on startup)
 */
export async function cleanupExpiredAuditLogs(): Promise<number> {
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired audit logs:', error);
    return 0;
  }
}

/**
 * Helper to extract request info for audit logging
 */
export function getRequestInfo(request: Request): {
  ipAddress: string;
  userAgent: string | undefined;
} {
  // Try various headers for IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  let ipAddress = '127.0.0.1';
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim();
  } else if (realIP) {
    ipAddress = realIP;
  } else if (cfConnectingIP) {
    ipAddress = cfConnectingIP;
  }

  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}
