import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { verifyTrustedBrowser } from '@/lib/trustedBrowser';
import { cookies } from 'next/headers';

const TRUSTED_BROWSER_COOKIE = 'infinityu_trusted_browser';

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(request);
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();
    const trustedBrowserToken = cookieStore.get(TRUSTED_BROWSER_COOKIE)?.value;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true, totpEnabled: true, isActive: true },
    });

    if (!user || user.role !== 'admin' || !user.isActive) {
      await logAuditEvent({ action: 'login_failed', actor: email, ipAddress, userAgent, details: { reason: 'User not found or not admin' }, success: false });
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.password) {
      await logAuditEvent({ action: 'login_failed', actor: email, actorId: user.id, actorRole: 'admin', ipAddress, userAgent, details: { reason: 'No password set' }, success: false });
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await logAuditEvent({ action: 'login_failed', actor: email, actorId: user.id, actorRole: 'admin', ipAddress, userAgent, details: { reason: 'Invalid password' }, success: false });
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.totpEnabled) {
      if (trustedBrowserToken) {
        const isTrusted = await verifyTrustedBrowser(user.id, trustedBrowserToken);
        if (isTrusted) return NextResponse.json({ success: true, requires2FA: false, trustedBrowser: true });
      }
      return NextResponse.json({ success: true, requires2FA: true, userId: user.id });
    }

    return NextResponse.json({ success: true, requires2FA: false });
  } catch (error) {
    console.error('Check credentials error:', error);
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 });
  }
}
