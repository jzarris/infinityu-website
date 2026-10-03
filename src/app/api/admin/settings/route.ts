import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSettings, saveSettings, maskApiKey, SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER } from '@/lib/settings';
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
      twilio_account_sid: {
        configured: !!(settings.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID),
        source: settings.twilio_account_sid ? 'admin' : process.env.TWILIO_ACCOUNT_SID ? 'env' : null,
        maskedValue: maskApiKey(settings.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID),
      },
      twilio_auth_token: {
        configured: !!(settings.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN),
        source: settings.twilio_auth_token ? 'admin' : process.env.TWILIO_AUTH_TOKEN ? 'env' : null,
        maskedValue: maskApiKey(settings.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN),
      },
      twilio_verify_service_sid: {
        configured: !!(settings.twilio_verify_service_sid || process.env.TWILIO_VERIFY_SERVICE_SID),
        source: settings.twilio_verify_service_sid ? 'admin' : process.env.TWILIO_VERIFY_SERVICE_SID ? 'env' : null,
        maskedValue: maskApiKey(settings.twilio_verify_service_sid || process.env.TWILIO_VERIFY_SERVICE_SID),
      },
      twilio_from_phone: {
        configured: !!(settings.twilio_from_phone || process.env.TWILIO_FROM_PHONE),
        source: settings.twilio_from_phone ? 'admin' : process.env.TWILIO_FROM_PHONE ? 'env' : null,
        value: settings.twilio_from_phone || process.env.TWILIO_FROM_PHONE || null,
      },
      admin_notification_phone: {
        configured: !!(settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE),
        source: settings.admin_notification_phone ? 'admin' : process.env.ADMIN_NOTIFICATION_PHONE ? 'env' : null,
        value: settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE || null,
      },
      simulator_enabled: settings.simulator_enabled === 'true',
      simulator_typical_results: settings.simulator_typical_results ?? SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER,
      simulator_max_loss_fraction: settings.simulator_max_loss_fraction ? parseFloat(settings.simulator_max_loss_fraction) : 0.2,
      simulator_retention_days_lead: settings.simulator_retention_days_lead ? parseInt(settings.simulator_retention_days_lead, 10) : 30,
      simulator_retention_days_patient: settings.simulator_retention_days_patient ? parseInt(settings.simulator_retention_days_patient, 10) : 365,
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
    const validKeys = [
      'anthropic_api_key', 'resend_api_key', 'instagram_access_token', 'instagram_post_urls',
      'contact_notification_email', 'twilio_account_sid', 'twilio_auth_token',
      'twilio_verify_service_sid', 'twilio_from_phone', 'admin_notification_phone',
      'simulator_enabled', 'simulator_typical_results', 'simulator_max_loss_fraction',
      'simulator_retention_days_lead', 'simulator_retention_days_patient',
    ];
    if (!validKeys.includes(key)) {
      return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
    }

    const settings = await getSettings();

    const booleanKeys = ['simulator_enabled'];
    const numberKeys = ['simulator_retention_days_lead', 'simulator_retention_days_patient'];
    const fractionKeys = ['simulator_max_loss_fraction'];

    if (booleanKeys.includes(key)) {
      settings[key] = value ? 'true' : 'false';
    } else if (fractionKeys.includes(key)) {
      const f = parseFloat(String(value));
      if (isNaN(f) || f <= 0 || f > 0.35) {
        delete settings[key];
      } else {
        settings[key] = String(f);
      }
    } else if (numberKeys.includes(key)) {
      const n = parseInt(String(value), 10);
      if (isNaN(n) || n < 1) {
        delete settings[key];
      } else {
        settings[key] = String(n);
      }
    } else if (value === null || value === '') {
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
