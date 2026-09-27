import { NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import { currentConsent, prefillFor, simulatorAvailability } from '@/lib/simulator-service';
import { getSimulatorSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * GET /api/simulate/context
 * Everything the simulator page needs to render its first screen.
 */
export async function GET() {
  const subject = await getSimulatorSubject();
  if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

  const [availability, consent, prefill, settings, latest] = await Promise.all([
    simulatorAvailability(),
    currentConsent(subject.userId),
    prefillFor(subject.userId),
    getSimulatorSettings(),
    prisma.simulation.findFirst({
      where: { userId: subject.userId, deletedAt: null, status: { in: ['pending', 'done'] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true },
    }),
  ]);

  return NextResponse.json(
    {
      available: availability.ok,
      cohort: subject.cohort,
      consentGiven: !!consent,
      prefill,
      maxLossFraction: settings.maxLossFraction,
      typicalResults: settings.typicalResults,
      latestSimulation: latest,
    },
    { headers: NO_STORE }
  );
}
