import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, rating, date, treatment, text, isActive } = body;

  if (!name || !text || !date || !treatment) {
    return NextResponse.json({ error: 'name, text, date, and treatment are required' }, { status: 400 });
  }

  const maxOrder = await prisma.testimonial.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const testimonial = await prisma.testimonial.create({
    data: {
      name,
      rating: typeof rating === 'number' ? rating : 5,
      date,
      treatment,
      text,
      isActive: isActive !== false,
      sortOrder: nextOrder,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
