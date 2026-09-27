import { NextRequest, NextResponse } from 'next/server';
import { getSimulatorSubject } from '@/lib/simulator-subject';
import {
  MAX_UPLOAD_BYTES,
  SimulatorError,
  createSimulation,
  maybeRunRetentionSweep,
  simulatorAvailability,
} from '@/lib/simulator-service';
import { checkAll, dbRateLimitResponse } from '@/lib/rate-limit-db';
import { getClientIP } from '@/lib/rate-limit';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import type { MetricParams, Units } from '@/lib/units';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function errorJson(error: unknown): NextResponse {
  if (error instanceof SimulatorError) {
    return NextResponse.json({ error: error.code, message: error.message }, { status: error.status, headers: NO_STORE });
  }
  console.error('[simulate] unexpected error', error instanceof Error ? error.name : 'unknown');
  return NextResponse.json({ error: 'internal', message: 'Something went wrong.' }, { status: 500, headers: NO_STORE });
}

/**
 * POST /api/simulate  (multipart)
 * Fields: photo (JPEG/PNG), units, height_cm, weight_kg, target_weight_kg, sex, age.
 * Starts a simulation; returns { simulationId }. Poll /api/simulate/status.
 */
export async function POST(request: NextRequest) {
  try {
    const subject = await getSimulatorSubject();
    if (!subject) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });

    const availability = await simulatorAvailability();
    if (!availability.ok) {
      return NextResponse.json({ error: 'unavailable', message: 'The simulator is not available right now.' }, { status: 503, headers: NO_STORE });
    }

    const ip = getClientIP(request);
    const limit = await checkAll([
      [`sim:user:${subject.userId}`, { limit: 6, windowMs: 60 * 60 * 1000 }],
      [`sim:ip:${ip}`, { limit: 20, windowMs: 24 * 60 * 60 * 1000 }],
    ]);
    if (!limit.allowed) return dbRateLimitResponse(limit) as unknown as NextResponse;

    const form = await request.formData();
    const file = form.get('photo');
    if (!(file instanceof File)) throw new SimulatorError('invalid_image', 'No photo was provided.', 400);
    if (file.size > MAX_UPLOAD_BYTES) throw new SimulatorError('image_too_large', 'The photo is too large (8 MB max).', 413);

    const units = (form.get('units') === 'metric' ? 'metric' : 'imperial') as Units;
    const num = (k: string) => Number(form.get(k));
    const params: MetricParams = {
      height_cm: num('height_cm'),
      weight_kg: num('weight_kg'),
      target_weight_kg: num('target_weight_kg'),
      sex: String(form.get('sex') || '') as MetricParams['sex'],
      age: Math.round(num('age')),
    };

    const sim = await createSimulation({
      userId: subject.userId,
      cohort: subject.cohort,
      units,
      params,
      imageBytes: Buffer.from(await file.arrayBuffer()),
    });

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'simulation_created',
      actorId: subject.userId,
      actorRole: 'patient',
      targetId: sim.id,
      ipAddress,
      userAgent,
      details: { cohort: subject.cohort, units },
      success: true,
    });
    maybeRunRetentionSweep();

    return NextResponse.json({ simulationId: sim.id }, { status: 202, headers: NO_STORE });
  } catch (error) {
    return errorJson(error);
  }
}
