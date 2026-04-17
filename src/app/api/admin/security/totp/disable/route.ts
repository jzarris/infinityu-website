import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { totpSecret: null, totpEnabled: false } });
    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({ action: 'totp_disabled', actor: session.user.email || undefined, actorId: session.user.id, actorRole: 'admin', ipAddress, userAgent, success: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TOTP disable error:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}
