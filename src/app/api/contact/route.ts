import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, service, message,
      smsConsentTransactional, smsConsentMarketing,
      smsConsentTransactionalText, smsConsentMarketingText,
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Send via Resend if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || 'services@infinity-u.com';

    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: 'InfinityU Website <noreply@infinity-u.com>',
        to: contactEmail,
        replyTo: email,
        subject: `New Contact Form: ${service || 'General Inquiry'} - ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Service Interest:</strong> ${service || 'Not specified'}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr />
          <p><strong>SMS Consent (Transactional):</strong> ${smsConsentTransactional ? 'Yes' : 'No'}</p>
          <p><strong>SMS Consent (Marketing):</strong> ${smsConsentMarketing ? 'Yes' : 'No'}</p>
        `,
      });
    } else {
      console.log('Contact form submission (Resend not configured):', {
        name, email, phone, service, message,
      });
    }

    // Store SMS consent records for TCPA compliance
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || undefined;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (smsConsentTransactionalText) {
      await prisma.smsConsent.create({
        data: {
          email,
          phone: phone || null,
          firstName,
          lastName,
          consentType: 'transactional',
          consented: !!smsConsentTransactional,
          ipAddress,
          userAgent,
          source: 'contact_form',
          consentText: smsConsentTransactionalText,
        },
      });
    }

    if (smsConsentMarketingText) {
      await prisma.smsConsent.create({
        data: {
          email,
          phone: phone || null,
          firstName,
          lastName,
          consentType: 'marketing',
          consented: !!smsConsentMarketing,
          ipAddress,
          userAgent,
          source: 'contact_form',
          consentText: smsConsentMarketingText,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }
}
