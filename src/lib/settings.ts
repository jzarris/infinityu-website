import { prisma } from '@/lib/prisma';

export interface Settings {
  anthropic_api_key?: string;
  resend_api_key?: string;
  instagram_access_token?: string;
  instagram_post_urls?: string;
  contact_notification_email?: string;
  updated_at: string;
  [key: string]: string | undefined;
}

const VALID_KEYS = [
  'anthropic_api_key',
  'resend_api_key',
  'instagram_access_token',
  'instagram_post_urls',
  'contact_notification_email',
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
