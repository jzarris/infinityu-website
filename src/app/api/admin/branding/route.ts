import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const BRANDING_DIR = path.join(process.cwd(), 'public', 'branding');
const CONFIG_FILE = path.join(process.cwd(), 'data', 'config', 'branding.json');

interface BrandingConfig {
  logoFilename?: string;
  faviconFilename?: string;
  updated_at: string;
}

async function getConfig(): Promise<BrandingConfig> {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { updated_at: new Date().toISOString() };
  }
}

async function saveConfig(config: BrandingConfig): Promise<void> {
  const dir = path.dirname(CONFIG_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const ALLOWED_FAVICON_TYPES = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FAVICON_SIZE = 1 * 1024 * 1024; // 1MB

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
  };
  return map[mimeType] || 'png';
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getConfig();
    return NextResponse.json({
      logo: config.logoFilename ? `/branding/${config.logoFilename}` : null,
      favicon: config.faviconFilename ? `/branding/${config.faviconFilename}` : null,
      updated_at: config.updated_at,
    });
  } catch (error) {
    console.error('Branding GET error:', error);
    return NextResponse.json({ error: 'Failed to get branding' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'File and type (logo/favicon) are required' }, { status: 400 });
    }

    const allowedTypes = type === 'logo' ? ALLOWED_LOGO_TYPES : ALLOWED_FAVICON_TYPES;
    const maxSize = type === 'logo' ? MAX_LOGO_SIZE : MAX_FAVICON_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max: ${maxSize / 1024 / 1024}MB` }, { status: 400 });
    }

    await mkdir(BRANDING_DIR, { recursive: true });

    const ext = getExtension(file.type);
    const filename = `${type}.${ext}`;
    const filepath = path.join(BRANDING_DIR, filename);

    // Delete old file if extension differs
    const config = await getConfig();
    const oldFilename = type === 'logo' ? config.logoFilename : config.faviconFilename;
    if (oldFilename && oldFilename !== filename) {
      const oldPath = path.join(BRANDING_DIR, oldFilename);
      if (existsSync(oldPath)) {
        await unlink(oldPath);
      }
    }

    // Write new file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Update config
    if (type === 'logo') {
      config.logoFilename = filename;
    } else {
      config.faviconFilename = filename;
    }
    config.updated_at = new Date().toISOString();
    await saveConfig(config);

    return NextResponse.json({
      success: true,
      path: `/branding/${filename}`,
    });
  } catch (error) {
    console.error('Branding upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();
    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'Type (logo/favicon) is required' }, { status: 400 });
    }

    const config = await getConfig();
    const filename = type === 'logo' ? config.logoFilename : config.faviconFilename;

    if (filename) {
      const filepath = path.join(BRANDING_DIR, filename);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    }

    if (type === 'logo') {
      delete config.logoFilename;
    } else {
      delete config.faviconFilename;
    }
    config.updated_at = new Date().toISOString();
    await saveConfig(config);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Branding delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
