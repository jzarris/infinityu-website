import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { deletePhotoCascade, deleteSimulation } from '@/lib/simulator-service';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/admin/simulations/delete   { simulationId } | { photoId }
 * Deleting a photo removes every simulation made from it.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = (await request.json().catch(() => ({}))) as { simulationId?: string; photoId?: string };
  const { ipAddress, userAgent } = getRequestInfo(request);

  if (body.photoId) {
    const photo = await prisma.bodyPhoto.findUnique({ where: { id: body.photoId }, select: { id: true } });
    if (!photo) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });
    await deletePhotoCascade(photo.id);
    await logAuditEvent({
      action: 'photo_deleted', actor: session.user.email || undefined, actorId: session.user.id, actorRole: 'admin',
      targetId: photo.id, ipAddress, userAgent, details: { by: 'admin' }, success: true,
    });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  if (body.simulationId) {
    const sim = await prisma.simulation.findUnique({ where: { id: body.simulationId }, select: { id: true } });
    if (!sim) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });
    await deleteSimulation(sim.id);
    await logAuditEvent({
      action: 'simulation_deleted', actor: session.user.email || undefined, actorId: session.user.id, actorRole: 'admin',
      targetId: sim.id, ipAddress, userAgent, success: true,
    });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });
}
