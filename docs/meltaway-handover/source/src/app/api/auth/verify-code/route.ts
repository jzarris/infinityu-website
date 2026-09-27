import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isTwilioConfigured } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { getClientIP } from '@/lib/rate-limit';
import { checkAll, dbRateLimitResponse, normalizePhoneKey, otpVerifyChecks } from '@/lib/rate-limit-db';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

/**
 * Verify a code and authenticate the user or verify their phone
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
      // Find the user and create a session
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
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if the account is active
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Your account has been disabled. Please contact support.' },
          { status: 403 }
        );
      }

      // Create a JWT session token manually
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        return NextResponse.json(
          { success: false, error: 'Auth configuration error' },
          { status: 500 }
        );
      }

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieName = isProduction
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token';

      const token = await encode({
        token: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          totpEnabled: false,
        },
        secret,
        salt: cookieName,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      // Set the session cookie
      const cookieStore = await cookies();

      cookieStore.set(cookieName, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return NextResponse.json({
        success: true,
        verified: true,
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    if (purpose === 'intake') {
      // Just verify the phone - don't create a session
      // The intake form will use this to mark the phone as verified
      return NextResponse.json({
        success: true,
        verified: true,
      });
    }

    // Default: just verify the code
    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
