import { readFile } from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'config', 'settings.json');

interface Settings {
  anthropic_api_key?: string;
  resend_api_key?: string;
  instagram_access_token?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_verify_service_sid?: string;
  twilio_from_phone?: string;
  admin_notification_phone?: string;
  contact_notification_email?: string;
  zoho_client_id?: string;
  zoho_client_secret?: string;
  zoho_intake_contacts?: { enabled: boolean; moduleName: string };
  zoho_intake_leads?: { enabled: boolean; moduleName: string };
  zoho_intake_custom?: { enabled: boolean; moduleName: string };
  // Asher Med integration
  asher_api_key?: string;
  asher_sync_interval?: number; // Sync interval in minutes (default: 15)
  // AestheticIQ integration
  aestheticiq_api_token?: string;
  aestheticiq_base_url?: string;
  aestheticiq_sync_interval?: number; // Sync interval in minutes (default: 15)
  // Display settings
  show_contact_phone?: boolean;
  // SMS templates
  sms_templates?: Array<{ id: string; name: string; message: string }>;
  // Body simulator
  simulator_enabled?: boolean; // kill switch; default off
  simulator_typical_results?: string; // substantiated figure shown on every image
  simulator_max_loss_fraction?: number; // cap on goal as a fraction of current weight (default 0.2)
  simulator_retention_days_lead?: number; // retention for people without an order (default 30)
  simulator_retention_days_patient?: number; // retention for patients with an order (default 365)
  updated_at: string;
}

export interface SimulatorSettings {
  enabled: boolean;
  typicalResults: string;
  maxLossFraction: number;
  retentionDaysLead: number;
  retentionDaysPatient: number;
}

export const SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER = 'Typical results: NOT YET SUBSTANTIATED';

export async function getSimulatorSettings(): Promise<SimulatorSettings> {
  const s = await getSettings();
  return {
    enabled: s.simulator_enabled ?? false,
    typicalResults: s.simulator_typical_results || SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER,
    maxLossFraction: s.simulator_max_loss_fraction ?? 0.2,
    retentionDaysLead: s.simulator_retention_days_lead ?? 30,
    retentionDaysPatient: s.simulator_retention_days_patient ?? 365,
  };
}

/**
 * Get all settings from file storage
 */
export async function getSettings(): Promise<Settings> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { updated_at: new Date().toISOString() };
  }
}

/**
 * Get a specific setting value, with fallback to environment variable
 */
export async function getSetting(key: keyof Settings): Promise<string | undefined> {
  const settings = await getSettings();
  const settingValue = settings[key];

  // Return setting if it's a string
  if (typeof settingValue === 'string') {
    return settingValue;
  }

  // Map setting keys to environment variable names
  const envMap: Record<string, string> = {
    anthropic_api_key: 'ANTHROPIC_API_KEY',
    resend_api_key: 'RESEND_API_KEY',
    instagram_access_token: 'INSTAGRAM_ACCESS_TOKEN',
    twilio_account_sid: 'TWILIO_ACCOUNT_SID',
    twilio_auth_token: 'TWILIO_AUTH_TOKEN',
    twilio_verify_service_sid: 'TWILIO_VERIFY_SERVICE_SID',
    twilio_from_phone: 'TWILIO_FROM_PHONE',
    admin_notification_phone: 'ADMIN_NOTIFICATION_PHONE',
    contact_notification_email: 'CONTACT_NOTIFICATION_EMAIL',
    zoho_client_id: 'ZOHO_CLIENT_ID',
    zoho_client_secret: 'ZOHO_CLIENT_SECRET',
    asher_api_key: 'ASHER_API_KEY',
    aestheticiq_api_token: 'AESTHETICIQ_API_TOKEN',
    aestheticiq_base_url: 'AESTHETICIQ_BASE_URL',
  };

  const envKey = envMap[key];
  return envKey ? process.env[envKey] : undefined;
}

/**
 * Get the contact notification email address
 */
export async function getContactNotificationEmail(): Promise<string | undefined> {
  return getSetting('contact_notification_email');
}

/**
 * Get the admin notification phone number
 */
export async function getAdminNotificationPhone(): Promise<string | undefined> {
  return getSetting('admin_notification_phone');
}

/**
 * Get whether to show phone number on contact page (default: false)
 */
export async function getShowContactPhone(): Promise<boolean> {
  const settings = await getSettings();
  return settings.show_contact_phone ?? false;
}

/**
 * SMS Template interface
 */
export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
}

/**
 * Get SMS templates with defaults if none exist
 */
export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  const settings = await getSettings();

  // Return saved templates or defaults
  return settings.sms_templates ?? [
    {
      id: 'intake-link',
      name: 'Intake Link',
      message: 'Hi! Please complete your intake form using this link: ',
    },
    {
      id: 'asher-order',
      name: 'Asher Order',
      message: 'Hi! Your Asher order is ready. Complete it here: ',
    },
    {
      id: 'call-request',
      name: 'Call Request',
      message: 'Hi! This is MeltAway MD. Please give us a call when you have a moment.',
    },
  ];
}
