import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isTwilioConfigured } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getClientIP } from '@/lib/rate-limit';
import { checkAll, dbRateLimitResponse, normalizePhoneKey, otpVerifyChecks } from '@/lib/rate-limit-db';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { issueSimAccessToken, simAccessCookieOptions, SIM_ACCESS_COOKIE } from '@/lib/sim-access';

/**
 * Verify a code and authenticate the user or verify their phone.
 *
 * For purpose === 'login': Infinity-U has no patient NextAuth sessions, so we
 * issue a sim_access cookie instead of a JWT session token. This lets the user
 * return to /simulate and resume their latest run.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, code, purpose } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone and code are required' },
        { status: 400 }
      );
    }

    // Every attempt counts, right or wrong: a six-digit code must not be guessable.
    const clientIP = getClientIP(request);
    const limit = await checkAll(otpVerifyChecks(normalizePhoneKey(String(phone)), clientIP));
    if (!limit.allowed) {
      if (limit.locked) {
        const { ipAddress, userAgent } = getRequestInfo(request);
        await logAuditEvent({
          action: 'otp_locked', ipAddress, userAgent,
          details: { endpoint: 'verify-code', retryAfterSec: limit.retryAfterSec }, success: false,
        });
      }
      return dbRateLimitResponse(limit);
    }

    if (!(await isTwilioConfigured())) {
      return NextResponse.json(
        { success: false, error: 'SMS verification is not configured' },
        { status: 503 }
      );
    }

    // Verify the code with Twilio
    const result = await verifyCode(phone, code);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Handle different purposes
    if (purpose === 'login') {
      // Find the active patient with this verified phone number
      const user = await prisma.user.findFirst({
        where: {
          phone: {
            contains: phone.replace(/\D/g, '').slice(-10),
          },
          role: 'patient',
          phoneVerified: true,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Your account has been disabled. Please contact support.' },
          { status: 403 }
        );
      }

      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        return NextResponse.json(
          { success: false, error: 'Auth configuration error' },
          { status: 500 }
        );
      }

      // Issue a sim_access cookie; no patient NextAuth session in Infinity-U
      const token = issueSimAccessToken(user.id, secret);
      const cookieStore = await cookies();
      cookieStore.set(SIM_ACCESS_COOKIE, token, simAccessCookieOptions());

      return NextResponse.json({ success: true, verified: true, authenticated: true });
    }

    if (purpose === 'intake') {
      // Just verify the phone — the intake form records phoneVerified on submit
      return NextResponse.json({ success: true, verified: true });
    }

    // Default: just verify the code
    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
