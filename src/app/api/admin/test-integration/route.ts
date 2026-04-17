import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration, email } = await request.json();
    const settings = await getSettings();

    if (integration === 'anthropic') {
      const apiKey = settings.anthropic_api_key || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 400 });
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 50, messages: [{ role: 'user', content: 'Reply with exactly: "API connection successful!"' }] }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json({ success: false, error: err.error?.message || `Status ${response.status}` }, { status: response.status });
      }
      return NextResponse.json({ success: true, message: 'Claude API is working' });
    }

    if (integration === 'resend') {
      const apiKey = settings.resend_api_key || process.env.RESEND_API_KEY;
      if (!apiKey) return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 400 });
      if (!email) return NextResponse.json({ success: false, error: 'Email required for test' }, { status: 400 });
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: 'InfinityU <noreply@infinity-u.com>',
          to: email,
          subject: 'InfinityU - Test Email',
          html: '<h2>Test Email Successful!</h2><p>Your Resend integration is working correctly.</p>',
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json({ success: false, error: err.message || `Status ${response.status}` }, { status: response.status });
      }
      return NextResponse.json({ success: true, message: `Test email sent to ${email}` });
    }

    if (integration === 'instagram') {
      const token = settings.instagram_access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
      if (!token) return NextResponse.json({ success: false, error: 'Token not configured' }, { status: 400 });
      const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${token}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json({ success: false, error: err.error?.message || `Status ${response.status}` }, { status: response.status });
      }
      const data = await response.json();
      return NextResponse.json({ success: true, message: 'Instagram API is working', details: { username: data.username } });
    }

    return NextResponse.json({ error: 'Invalid integration' }, { status: 400 });
  } catch (error) {
    console.error('Test integration error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
