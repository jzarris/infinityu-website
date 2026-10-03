import { NextRequest, NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { SimulatorError, pollSimulation, simulationImages } from '@/lib/simulator-service';
import { requireOwnedRecord, AuthzError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/simulate/status   { simulationId }
 * The id travels in the body, never in a URL. Returns the state and, when
 * done, the images as data URLs inside the JSON body.
 */
export async function POST(request: NextRequest) {
  try {
    const subject = await getSimulatorSubject();
    if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

    const { simulationId } = (await request.json()) as { simulationId?: string };
    if (!simulationId || typeof simulationId !== 'string') {
      return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });
    }

    await requireOwnedRecord({ userId: subject.userId, role: 'patient' }, () =>
      prisma.simulation.findFirst({ where: { id: simulationId, deletedAt: null } })
    );

    const { sim, progress } = await pollSimulation(simulationId);
    const base = {
      simulationId: sim.id,
      status: sim.status,
      units: sim.units,
      display: JSON.parse(sim.paramsDisplay),
      goalCapped: Math.abs(sim.goalWeightKgApplied - sim.goalWeightKgRequested) > 1e-6,
      notifyRequested: sim.notifyRequested,
      progress,
    };

    if (sim.status === 'done') {
      const images = await simulationImages(sim);
      return NextResponse.json({ ...base, images }, { headers: NO_STORE });
    }
    if (sim.status === 'refused' || sim.status === 'failed') {
      return NextResponse.json(
        { ...base, userMessage: sim.userMessage, refusalReasons: sim.refusalReasons ? JSON.parse(sim.refusalReasons) : [] },
        { headers: NO_STORE }
      );
    }
    return NextResponse.json(base, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE });
    }
    if (error instanceof SimulatorError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error('[simulate/status] unexpected error', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'internal' }, { status: 500, headers: NO_STORE });
  }
}
