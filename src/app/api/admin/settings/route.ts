import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSettings, saveSettings, maskApiKey } from '@/lib/settings';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();

    return NextResponse.json({
      anthropic: {
        configured: !!(settings.anthropic_api_key || process.env.ANTHROPIC_API_KEY),
        source: settings.anthropic_api_key ? 'admin' : process.env.ANTHROPIC_API_KEY ? 'env' : null,
        maskedValue: maskApiKey(settings.anthropic_api_key || process.env.ANTHROPIC_API_KEY),
      },
      resend: {
        configured: !!(settings.resend_api_key || process.env.RESEND_API_KEY),
        source: settings.resend_api_key ? 'admin' : process.env.RESEND_API_KEY ? 'env' : null,
        maskedValue: maskApiKey(settings.resend_api_key || process.env.RESEND_API_KEY),
      },
      instagram: {
        configured: !!(settings.instagram_access_token || process.env.INSTAGRAM_ACCESS_TOKEN),
        source: settings.instagram_access_token ? 'admin' : process.env.INSTAGRAM_ACCESS_TOKEN ? 'env' : null,
        maskedValue: maskApiKey(settings.instagram_access_token || process.env.INSTAGRAM_ACCESS_TOKEN),
      },
      instagram_post_urls: {
        configured: !!(settings.instagram_post_urls || process.env.INSTAGRAM_POST_URLS),
        source: settings.instagram_post_urls ? 'admin' : process.env.INSTAGRAM_POST_URLS ? 'env' : null,
        value: settings.instagram_post_urls || process.env.INSTAGRAM_POST_URLS || '',
      },
      contact_notification_email: {
        configured: !!(settings.contact_notification_email || process.env.CONTACT_EMAIL),
        source: settings.contact_notification_email ? 'admin' : process.env.CONTACT_EMAIL ? 'env' : null,
        maskedValue: settings.contact_notification_email || process.env.CONTACT_EMAIL || null,
      },
      updated_at: settings.updated_at,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await request.json();
    const validKeys = ['anthropic_api_key', 'resend_api_key', 'instagram_access_token', 'instagram_post_urls', 'contact_notification_email'];
    if (!validKeys.includes(key)) {
      return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
    }

    const settings = await getSettings();
    if (value === null || value === '') {
      delete settings[key];
    } else {
      settings[key] = value;
    }
    settings.updated_at = new Date().toISOString();
    await saveSettings(settings);

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: value ? 'setting_updated' : 'setting_removed',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      target: key,
      ipAddress,
      userAgent,
      details: { key, hasValue: !!value },
      success: true,
    });

    return NextResponse.json({ success: true, message: value ? 'Setting saved' : 'Setting removed' });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
