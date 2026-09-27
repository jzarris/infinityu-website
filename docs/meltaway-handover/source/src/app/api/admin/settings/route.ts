import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdminApi } from '@/lib/authz';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import { clearJwtCache as clearAestheticIQJwtCache } from '@/lib/aestheticiq';
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'config', 'settings.json');

interface ZohoModuleConfig {
  enabled: boolean;
  moduleName: string; // API name like 'Contacts', 'Leads', or custom module name
}

interface Settings {
  anthropic_api_key?: string;
  resend_api_key?: string;
  instagram_access_token?: string;
  instagram_post_urls?: string; // Comma-separated URLs for Instagram embeds
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_verify_service_sid?: string;
  twilio_from_phone?: string;
  admin_notification_phone?: string;
  contact_notification_email?: string;
  // Zoho CRM credentials
  zoho_client_id?: string;
  zoho_client_secret?: string;
  // Zoho CRM module settings for intake submissions
  zoho_intake_contacts?: ZohoModuleConfig;
  zoho_intake_leads?: ZohoModuleConfig;
  zoho_intake_custom?: ZohoModuleConfig;
  // Asher Med integration
  asher_api_key?: string;
  asher_sync_interval?: number; // Sync interval in minutes (default: 15)
  // AestheticIQ integration
  aestheticiq_api_token?: string;
  aestheticiq_base_url?: string;
  aestheticiq_sync_interval?: number; // Sync interval in minutes (default: 15)
  // Display settings
  show_contact_phone?: boolean;
  updated_at: string;
  [key: string]: string | boolean | number | ZohoModuleConfig | undefined;
}

async function getSettings(): Promise<Settings> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { updated_at: new Date().toISOString() };
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  const dir = path.dirname(SETTINGS_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

/**
 * Get current settings status (masked values)
 */
export async function GET() {
  try {
    const session = await requireAdminApi();
    if (session instanceof NextResponse) return session;

    const settings = await getSettings();

    // Return masked status for each setting
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
        maskedValue: settings.twilio_from_phone || process.env.TWILIO_FROM_PHONE || null,
      },
      admin_notification_phone: {
        configured: !!(settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE),
        source: settings.admin_notification_phone ? 'admin' : process.env.ADMIN_NOTIFICATION_PHONE ? 'env' : null,
        maskedValue: settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE || null,
      },
      contact_notification_email: {
        configured: !!(settings.contact_notification_email || process.env.CONTACT_NOTIFICATION_EMAIL),
        source: settings.contact_notification_email ? 'admin' : process.env.CONTACT_NOTIFICATION_EMAIL ? 'env' : null,
        maskedValue: settings.contact_notification_email || process.env.CONTACT_NOTIFICATION_EMAIL || null,
      },
      // Zoho CRM credentials
      zoho_client_id: {
        configured: !!(settings.zoho_client_id || process.env.ZOHO_CLIENT_ID),
        source: settings.zoho_client_id ? 'admin' : process.env.ZOHO_CLIENT_ID ? 'env' : null,
        maskedValue: maskApiKey(settings.zoho_client_id || process.env.ZOHO_CLIENT_ID),
      },
      zoho_client_secret: {
        configured: !!(settings.zoho_client_secret || process.env.ZOHO_CLIENT_SECRET),
        source: settings.zoho_client_secret ? 'admin' : process.env.ZOHO_CLIENT_SECRET ? 'env' : null,
        maskedValue: maskApiKey(settings.zoho_client_secret || process.env.ZOHO_CLIENT_SECRET),
      },
      // Zoho CRM module settings - defaults to Contacts enabled if not configured
      zoho_intake_contacts: settings.zoho_intake_contacts ?? { enabled: true, moduleName: 'Contacts' },
      zoho_intake_leads: settings.zoho_intake_leads ?? { enabled: true, moduleName: 'Leads' },
      zoho_intake_custom: settings.zoho_intake_custom ?? { enabled: false, moduleName: '' },
      // Asher Med integration
      asher: {
        configured: !!(settings.asher_api_key || process.env.ASHER_API_KEY),
        source: settings.asher_api_key ? 'admin' : process.env.ASHER_API_KEY ? 'env' : null,
        maskedValue: maskApiKey(settings.asher_api_key || process.env.ASHER_API_KEY),
      },
      asher_sync_interval: settings.asher_sync_interval ?? 15, // Default 15 minutes
      // AestheticIQ integration
      aestheticiq: {
        configured: !!(
          (settings.aestheticiq_api_token || process.env.AESTHETICIQ_API_TOKEN) &&
          (settings.aestheticiq_base_url || process.env.AESTHETICIQ_BASE_URL)
        ),
        source: settings.aestheticiq_api_token ? 'admin' : process.env.AESTHETICIQ_API_TOKEN ? 'env' : null,
        maskedValue: maskApiKey(settings.aestheticiq_api_token || process.env.AESTHETICIQ_API_TOKEN),
        baseUrl: settings.aestheticiq_base_url || process.env.AESTHETICIQ_BASE_URL || null,
      },
      aestheticiq_sync_interval: settings.aestheticiq_sync_interval ?? 15, // Default 15 minutes
      // Display settings
      show_contact_phone: settings.show_contact_phone ?? false,
      // Body simulator
      simulator_enabled: settings.simulator_enabled ?? false,
      simulator_typical_results: settings.simulator_typical_results ?? '',
      simulator_max_loss_fraction: settings.simulator_max_loss_fraction ?? 0.2,
      simulator_retention_days_lead: settings.simulator_retention_days_lead ?? 30,
      simulator_retention_days_patient: settings.simulator_retention_days_patient ?? 365,
      updated_at: settings.updated_at,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * Update a setting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminApi();
    if (session instanceof NextResponse) return session;

    const { key, value } = await request.json();

    const validKeys = [
      'anthropic_api_key',
      'resend_api_key',
      'instagram_access_token',
      'instagram_post_urls',
      'twilio_account_sid',
      'twilio_auth_token',
      'twilio_verify_service_sid',
      'twilio_from_phone',
      'admin_notification_phone',
      'contact_notification_email',
      'zoho_client_id',
      'zoho_client_secret',
      'zoho_intake_contacts',
      'zoho_intake_leads',
      'zoho_intake_custom',
      'asher_api_key',
      'asher_sync_interval',
      'aestheticiq_api_token',
      'aestheticiq_base_url',
      'aestheticiq_sync_interval',
      'show_contact_phone',
      'simulator_enabled',
      'simulator_typical_results',
      'simulator_max_loss_fraction',
      'simulator_retention_days_lead',
      'simulator_retention_days_patient',
    ];
    if (!validKeys.includes(key)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    const settings = await getSettings();

    // Handle Zoho module configs (objects) vs string values vs boolean values vs number values
    const zohoModuleKeys = ['zoho_intake_contacts', 'zoho_intake_leads', 'zoho_intake_custom'];
    const booleanKeys = ['show_contact_phone', 'simulator_enabled'];
    const numberKeys = ['asher_sync_interval', 'aestheticiq_sync_interval', 'simulator_retention_days_lead', 'simulator_retention_days_patient'];
    const fractionKeys = ['simulator_max_loss_fraction'];

    if (fractionKeys.includes(key)) {
      const f = parseFloat(String(value));
      if (isNaN(f) || f <= 0 || f > 0.35) {
        delete settings[key];
      } else {
        settings[key] = f;
      }
    } else if (zohoModuleKeys.includes(key)) {
      // Value should be a ZohoModuleConfig object
      if (value === null) {
        delete settings[key];
      } else {
        settings[key] = value;
      }
    } else if (booleanKeys.includes(key)) {
      // Boolean values - store as-is
      settings[key] = !!value;
    } else if (numberKeys.includes(key)) {
      // Number values - parse and validate
      const numValue = parseInt(String(value), 10);
      if (isNaN(numValue) || numValue < 1) {
        delete settings[key];
      } else {
        settings[key] = numValue;
      }
    } else if (value === null || value === '') {
      // Remove the setting (fall back to env var)
      delete settings[key];
    } else {
      // Update the setting
      settings[key] = value;
    }

    settings.updated_at = new Date().toISOString();
    await saveSettings(settings);

    // Invalidate cached JWT when AestheticIQ credentials change
    if (key === 'aestheticiq_api_token' || key === 'aestheticiq_base_url') {
      clearAestheticIQJwtCache();
    }

    // Log audit event
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

    return NextResponse.json({
      success: true,
      message: value ? 'Setting saved' : 'Setting removed (using environment variable)',
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

function maskApiKey(key: string | undefined): string | null {
  if (!key) return null;
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}
