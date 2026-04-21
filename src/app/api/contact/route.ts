import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { getSettings } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(request);

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

    // Get Resend API key from admin settings or env
    const settings = await getSettings();
    const resendApiKey = settings.resend_api_key || process.env.RESEND_API_KEY;
    const contactEmail = settings.contact_notification_email || process.env.CONTACT_EMAIL || 'services@infinity-u.com';

    let emailResult: { sent: boolean; resendResponse?: unknown; error?: string; destination?: string } = {
      sent: false,
      destination: contactEmail,
    };

    if (resendApiKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        const response = await resend.emails.send({
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

        emailResult = {
          sent: true,
          destination: contactEmail,
          resendResponse: response,
        };
      } catch (emailError) {
        emailResult = {
          sent: false,
          destination: contactEmail,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        };
      }
    } else {
      emailResult = {
        sent: false,
        destination: contactEmail,
        error: 'Resend API key not configured',
      };
    }

    // Store SMS consent records for TCPA compliance
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

    // Audit log with full form content, email destination, and Resend response
    await logAuditEvent({
      action: 'contact_form_submitted',
      actor: email,
      target: contactEmail,
      ipAddress,
      userAgent,
      success: emailResult.sent,
      details: {
        formData: {
          name,
          email,
          phone: phone || null,
          service: service || null,
          message,
          smsConsentTransactional: !!smsConsentTransactional,
          smsConsentMarketing: !!smsConsentMarketing,
        },
        email: emailResult,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);

    // Log the failure too
    await logAuditEvent({
      action: 'contact_form_submitted',
      ipAddress,
      userAgent,
      success: false,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }
}
