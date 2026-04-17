import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { event } = await request.json();
    const { ipAddress, userAgent } = getRequestInfo(request);

    if (session?.user && event === 'login_success') {
      await logAuditEvent({
        action: 'login_success',
        actor: session.user.email || undefined,
        actorId: session.user.id,
        actorRole: 'admin',
        ipAddress,
        userAgent,
        success: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
