import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSeoConfig, saveSeoConfig, SEO_PAGES } from '@/lib/seo-settings';
import type { PageSeoSettings } from '@/lib/seo-settings';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getSeoConfig();
    return NextResponse.json({ config, pages: SEO_PAGES });
  } catch (error) {
    console.error('SEO GET error:', error);
    return NextResponse.json({ error: 'Failed to get SEO config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageSlug, settings, global } = await request.json() as {
      pageSlug?: string;
      settings?: PageSeoSettings;
      global?: { siteTitle?: string; siteDescription?: string; keywords?: string[] };
    };

    const config = await getSeoConfig();

    if (global) {
      config.global = { ...config.global, ...global };
    }

    if (pageSlug && settings) {
      const validSlugs: string[] = SEO_PAGES.map(p => p.slug);
      if (!validSlugs.includes(pageSlug)) {
        return NextResponse.json({ error: 'Invalid page slug' }, { status: 400 });
      }
      config.pages[pageSlug] = settings;
    }

    await saveSeoConfig(config);

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'setting_updated',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      target: pageSlug ? `seo:${pageSlug}` : 'seo:global',
      ipAddress,
      userAgent,
      details: { pageSlug: pageSlug || 'global' },
      success: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO POST error:', error);
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 });
  }
}
