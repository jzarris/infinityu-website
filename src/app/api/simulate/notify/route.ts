import { NextRequest, NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { requestNotification } from '@/lib/simulator-service';
import { requireOwnedRecord, AuthzError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/simulate/notify   { simulationId }
 * Text the person when their run finishes. Accepts a JSON body or a beacon
 * (text/plain JSON) sent as the page is closed.
 */
export async function POST(request: NextRequest) {
  try {
    const subject = await getSimulatorSubject();
    if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

    let simulationId: string | undefined;
    try {
      const raw = await request.text();
      simulationId = (JSON.parse(raw || '{}') as { simulationId?: string }).simulationId;
    } catch {
      simulationId = undefined;
    }
    if (!simulationId) return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });

    await requireOwnedRecord({ userId: subject.userId, role: 'patient' }, () =>
      prisma.simulation.findFirst({ where: { id: simulationId, deletedAt: null } })
    );

    const result = await requestNotification(simulationId);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error('[simulate/notify] unexpected error', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'internal' }, { status: 500, headers: NO_STORE });
  }
}
