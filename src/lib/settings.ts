import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'config', 'settings.json');

export interface Settings {
  anthropic_api_key?: string;
  resend_api_key?: string;
  instagram_access_token?: string;
  instagram_post_urls?: string;
  contact_notification_email?: string;
  updated_at: string;
  [key: string]: string | undefined;
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { updated_at: new Date().toISOString() };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const dir = path.dirname(SETTINGS_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
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
