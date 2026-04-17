import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { currentPassword, newPassword } = await request.json();
    if (!newPassword || newPassword.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.password) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashedPassword } });
    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: user.password ? 'password_change' : 'password_set',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      ipAddress,
      userAgent,
      success: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
