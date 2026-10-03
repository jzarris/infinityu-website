import { NextRequest, NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { currentConsent, recordConsent } from '@/lib/simulator-service';
import { consentSummary } from '@/lib/consent-text';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** GET: current consent text and whether this person has already agreed to it. */
export async function GET() {
  const subject = await getSimulatorSubject();
  if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  const existing = await currentConsent(subject.userId);
  return NextResponse.json({ ...consentSummary(), given: !!existing, givenAt: existing?.createdAt ?? null }, { headers: NO_STORE });
}

/** POST: record agreement to the current consent version. */
export async function POST(request: NextRequest) {
  const subject = await getSimulatorSubject();
  if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

  const body = (await request.json().catch(() => ({}))) as { version?: string; agreed?: boolean };
  const summary = consentSummary();
  if (body.agreed !== true || body.version !== summary.version) {
    return NextResponse.json({ error: 'version_mismatch', message: 'Please review and accept the current terms.' }, { status: 400, headers: NO_STORE });
  }

  const { ipAddress, userAgent } = getRequestInfo(request);
  const consent = await recordConsent(subject.userId, ipAddress, userAgent);
  await logAuditEvent({
    action: 'photo_consent_given',
    actorId: subject.userId,
    actorRole: 'patient',
    targetId: consent.id,
    ipAddress,
    userAgent,
    details: { version: consent.version },
    success: true,
  });
  return NextResponse.json({ success: true, version: consent.version }, { headers: NO_STORE });
}
