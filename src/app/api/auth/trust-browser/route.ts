import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createTrustedBrowser } from '@/lib/trustedBrowser';
import { getRequestInfo, logAuditEvent } from '@/lib/audit';

const TRUSTED_BROWSER_COOKIE = 'infinityu_trusted_browser';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ipAddress, userAgent } = getRequestInfo(request);
    const token = await createTrustedBrowser(session.user.id, userAgent, ipAddress);

    await logAuditEvent({
      action: 'trusted_browser_added',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      ipAddress,
      userAgent,
      success: true,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(TRUSTED_BROWSER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
