import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'config', 'branding.json');

export async function GET() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    return NextResponse.json({
      logo: config.logoFilename ? `/branding/${config.logoFilename}` : null,
      favicon: config.faviconFilename ? `/branding/${config.faviconFilename}` : null,
    });
  } catch {
    return NextResponse.json({ logo: null, favicon: null });
  }
}
