import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/authz';
import { unlockPhone } from '@/lib/rate-limit-db';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/security/otp-unlock   { phone }
 * Clears the OTP send and verify limits for a phone number that got locked
 * (five wrong codes in 15 minutes, or three code sends in 15 minutes).
 */
export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { phone } = (await request.json().catch(() => ({}))) as { phone?: string };
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10) return NextResponse.json({ error: 'Enter a phone number' }, { status: 400 });

  const cleared = await unlockPhone(digits);
  const { ipAddress, userAgent } = getRequestInfo(request);
  await logAuditEvent({
    action: 'setting_updated',
    actor: session.user.email || undefined,
    actorId: session.user.id,
    actorRole: 'admin',
    target: 'otp_unlock',
    ipAddress,
    userAgent,
    details: { phoneLastFour: digits.slice(-4), cleared },
    success: true,
  });
  return NextResponse.json({ success: true, cleared });
}
