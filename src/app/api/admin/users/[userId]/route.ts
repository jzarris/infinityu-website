import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { name, email, role, isActive, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (newPassword) {
      if (newPassword.length < 12) {
        return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });

    const { ipAddress, userAgent } = getRequestInfo(request);
    const changes = Object.keys(updateData).filter(k => k !== 'password');
    if (newPassword) changes.push('password_reset');

    await logAuditEvent({
      action: 'user_updated',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      target: user.email || undefined,
      targetId: userId,
      ipAddress,
      userAgent,
      details: { changes },
      success: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'user_deleted',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      target: user.email || undefined,
      targetId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
