import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ImportRow {
  id?: string;
  name: string;
  rating: number;
  date: string;
  treatment: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const rows: ImportRow[] = body.testimonials;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No testimonials provided' }, { status: 400 });
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.name || !row.text) continue;

    const data = {
      name: String(row.name),
      rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
      date: String(row.date || ''),
      treatment: String(row.treatment || ''),
      text: String(row.text),
      isActive: row.isActive !== false && String(row.isActive) !== 'false' && String(row.isActive) !== '0',
      sortOrder: Number(row.sortOrder) || 0,
    };

    if (row.id) {
      const exists = await prisma.testimonial.findUnique({ where: { id: row.id } });
      if (exists) {
        await prisma.testimonial.update({ where: { id: row.id }, data });
        updated++;
        continue;
      }
    }

    await prisma.testimonial.create({ data });
    created++;
  }

  return NextResponse.json({ created, updated });
}
