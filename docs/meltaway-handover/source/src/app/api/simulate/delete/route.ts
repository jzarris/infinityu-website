import { NextRequest, NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { deletePhotoCascade } from '@/lib/simulator-service';
import { requireOwnedRecord, AuthzError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/simulate/delete   { simulationId }
 * Deletes the photo behind the simulation, every simulation made from it, and
 * every output. Patient-initiated; admins use their own route.
 */
export async function POST(request: NextRequest) {
  try {
    const subject = await getSimulatorSubject();
    if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

    const { simulationId } = (await request.json()) as { simulationId?: string };
    if (!simulationId) return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });

    const sim = await requireOwnedRecord({ userId: subject.userId, role: 'patient' }, () =>
      prisma.simulation.findUnique({ where: { id: simulationId } })
    );
    await deletePhotoCascade(sim.photoId);

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'photo_deleted',
      actorId: subject.userId,
      actorRole: 'patient',
      targetId: sim.photoId,
      ipAddress,
      userAgent,
      details: { by: 'patient' },
      success: true,
    });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error('[simulate/delete] unexpected error', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'internal' }, { status: 500, headers: NO_STORE });
  }
}
