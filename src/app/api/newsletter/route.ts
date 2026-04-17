import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Send confirmation to the subscriber
      await resend.emails.send({
        from: 'InfinityU Med Spa <noreply@infinity-u.com>',
        to: email,
        subject: 'Welcome to InfinityU Updates!',
        html: `
          <h2>Thank you for subscribing!</h2>
          <p>You'll be the first to hear about our special offers, new treatments, and exclusive promotions at InfinityU Med Spa.</p>
          <p>If you have any questions, feel free to reply to this email or call us at (714) 660-0702.</p>
          <p>Best,<br>The InfinityU Team</p>
        `,
      });

      // Notify the team
      const contactEmail = process.env.CONTACT_EMAIL || 'services@infinity-u.com';
      await resend.emails.send({
        from: 'InfinityU Website <noreply@infinity-u.com>',
        to: contactEmail,
        subject: `New Newsletter Subscriber: ${email}`,
        html: `<p>New newsletter signup: <strong>${email}</strong></p>`,
      });
    } else {
      console.log('Newsletter signup (Resend not configured):', email);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe.' },
      { status: 500 }
    );
  }
}
