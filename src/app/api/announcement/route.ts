import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      enabled: settings.announcement_enabled === 'true',
      html: settings.announcement_html || '',
    });
  } catch {
    return NextResponse.json({ enabled: false, html: '' });
  }
}
