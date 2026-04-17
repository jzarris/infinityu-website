import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTOTPSecret, generateTOTPUri } from '@/lib/totp';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, totpEnabled: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.totpEnabled) return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, user.email || 'admin@infinity-u.com');
    return NextResponse.json({ secret, uri });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}
