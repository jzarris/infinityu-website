import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/totp';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { code, secret } = await request.json();
    if (!code || !secret) return NextResponse.json({ error: 'Code and secret are required' }, { status: 400 });
    const isValid = verifyTOTP(secret, code);
    if (!isValid) return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    await prisma.user.update({ where: { id: session.user.id }, data: { totpSecret: secret, totpEnabled: true } });
    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({ action: 'totp_enabled', actor: session.user.email || undefined, actorId: session.user.id, actorRole: 'admin', ipAddress, userAgent, success: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TOTP verify error:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA code' }, { status: 500 });
  }
}
