import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const BRANDING_DIR = path.join(process.cwd(), 'public', 'branding');

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Sanitize filename to prevent directory traversal
  const sanitized = path.basename(filename);
  if (sanitized !== filename || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filepath = path.join(BRANDING_DIR, sanitized);
  if (!existsSync(filepath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const data = await readFile(filepath);
    const ext = path.extname(sanitized).slice(1).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
