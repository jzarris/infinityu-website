import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, password: true, totpEnabled: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ email: user.email, passwordSet: !!user.password, totpEnabled: user.totpEnabled });
  } catch (error) {
    console.error('Security status error:', error);
    return NextResponse.json({ error: 'Failed to get security status' }, { status: 500 });
  }
}
