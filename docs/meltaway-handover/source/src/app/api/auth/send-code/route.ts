import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode, isTwilioConfigured } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { rateLimiters, getClientIP, rateLimitResponse } from '@/lib/rate-limit';
import { checkAll, dbRateLimitResponse, otpSendChecks } from '@/lib/rate-limit-db';
import { errorResponse } from '@/lib/api-utils';

/**
 * Send a verification code to a phone number for authentication
 * Can be used for:
 * 1. Patient portal login (requires existing user with phone)
 * 2. Intake form phone verification (phone lookup only)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = await rateLimiters.auth(clientIP);

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const { phone, purpose } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!(await isTwilioConfigured())) {
      return NextResponse.json(
        { success: false, error: 'SMS verification is not configured' },
        { status: 503 }
      );
    }

    // Durable per-phone and per-IP send limits (the file-based limiter above is per process).
    const sendLimit = await checkAll(otpSendChecks(String(phone), clientIP));
    if (!sendLimit.allowed) {
      return dbRateLimitResponse(sendLimit);
    }

    // For login, verify the user exists with this phone number
    if (purpose === 'login') {
      const user = await prisma.user.findFirst({
        where: {
          phone: {
            contains: phone.replace(/\D/g, '').slice(-10), // Match last 10 digits
          },
          role: 'patient',
        },
        select: { id: true, phoneVerified: true },
      });

      if (!user) {
        // Don't reveal whether the phone exists for security
        return NextResponse.json(
          { success: false, error: 'Invalid phone number' },
          { status: 400 }
        );
      }

      if (!user.phoneVerified) {
        return NextResponse.json(
          { success: false, error: 'Phone number not verified. Please complete intake first.' },
          { status: 400 }
        );
      }
    }

    // Send the verification code
    const result = await sendVerificationCode(phone);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send code error:', error);
    return errorResponse(error, 'Failed to send verification code');
  }
}
