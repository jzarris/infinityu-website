import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { SimulatorError, pollSimulation, simulationImages } from '@/lib/simulator-service';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/admin/simulations/view   { simulationId }
 * Full record for troubleshooting: images, diagnostics, params, photo state.
 * Viewing is audit logged by id.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  try {
    const { simulationId } = (await request.json()) as { simulationId?: string };
    if (!simulationId) return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });

    const { sim } = await pollSimulation(simulationId);
    const full = await prisma.simulation.findUnique({
      where: { id: sim.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        photo: { select: { id: true, status: true, refusalReasons: true, retentionAt: true, width: true, height: true, capturedAt: true, sha256: true, consentId: true } },
      },
    });
    if (!full) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });

    let images: { original: string; outputs: Record<string, string> } | null = null;
    try {
      images = await simulationImages(full);
    } catch {
      images = null;
    }

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'simulation_viewed',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      targetId: full.id,
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json(
      {
        simulation: {
          ...full,
          paramsMetric: JSON.parse(full.paramsMetric),
          paramsDisplay: JSON.parse(full.paramsDisplay),
          diagnostics: full.diagnostics ? JSON.parse(full.diagnostics) : null,
          configOverrides: full.configOverrides ? JSON.parse(full.configOverrides) : null,
          refusalReasons: full.refusalReasons ? JSON.parse(full.refusalReasons) : [],
          outputKeys: undefined,
        },
        images,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof SimulatorError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error('[admin/simulations/view] error', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'internal' }, { status: 500, headers: NO_STORE });
  }
}
