import { prisma } from '@/lib/prisma';

export interface Settings {
  anthropic_api_key?: string;
  resend_api_key?: string;
  instagram_access_token?: string;
  instagram_post_urls?: string;
  contact_notification_email?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_verify_service_sid?: string;
  twilio_from_phone?: string;
  admin_notification_phone?: string;
  simulator_enabled?: string;
  simulator_typical_results?: string;
  simulator_max_loss_fraction?: string;
  simulator_retention_days_lead?: string;
  simulator_retention_days_patient?: string;
  updated_at: string;
  [key: string]: string | undefined;
}

export interface SimulatorSettings {
  enabled: boolean;
  typicalResults: string;
  maxLossFraction: number;
  retentionDaysLead: number;
  retentionDaysPatient: number;
}

export const SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER = 'Typical results: NOT YET SUBSTANTIATED';

const VALID_KEYS = [
  'anthropic_api_key',
  'resend_api_key',
  'instagram_access_token',
  'instagram_post_urls',
  'contact_notification_email',
  'twilio_account_sid',
  'twilio_auth_token',
  'twilio_verify_service_sid',
  'twilio_from_phone',
  'admin_notification_phone',
  'simulator_enabled',
  'simulator_typical_results',
  'simulator_max_loss_fraction',
  'simulator_retention_days_lead',
  'simulator_retention_days_patient',
];

export async function getSettings(): Promise<Settings> {
  try {
    const rows = await prisma.setting.findMany();
    const settings: Settings = { updated_at: new Date().toISOString() };
    for (const row of rows) {
      settings[row.key] = row.value;
      if (row.updatedAt.toISOString() > settings.updated_at) {
        settings.updated_at = row.updatedAt.toISOString();
      }
    }
    return settings;
  } catch {
    return { updated_at: new Date().toISOString() };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  for (const key of VALID_KEYS) {
    const value = settings[key];
    if (value) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    } else {
      await prisma.setting.deleteMany({ where: { key } });
    }
  }
}

export function maskApiKey(key: string | undefined): string | null {
  if (!key) return null;
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export async function getContactNotificationEmail(): Promise<string | null> {
  const settings = await getSettings();
  return settings.contact_notification_email || process.env.CONTACT_EMAIL || null;
}

export async function getAdminNotificationPhone(): Promise<string | null> {
  const settings = await getSettings();
  return settings.admin_notification_phone || process.env.ADMIN_NOTIFICATION_PHONE || null;
}

export async function getSimulatorSettings(): Promise<SimulatorSettings> {
  const s = await getSettings();
  return {
    enabled: s.simulator_enabled === 'true',
    typicalResults: s.simulator_typical_results || SIMULATOR_TYPICAL_RESULTS_PLACEHOLDER,
    maxLossFraction: s.simulator_max_loss_fraction ? parseFloat(s.simulator_max_loss_fraction) : 0.2,
    retentionDaysLead: s.simulator_retention_days_lead ? parseInt(s.simulator_retention_days_lead, 10) : 30,
    retentionDaysPatient: s.simulator_retention_days_patient ? parseInt(s.simulator_retention_days_patient, 10) : 365,
  };
}
