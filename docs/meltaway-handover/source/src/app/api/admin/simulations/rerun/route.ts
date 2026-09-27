import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { SimulatorError, createSimulation } from '@/lib/simulator-service';
import { logAuditEvent, getRequestInfo } from '@/lib/audit';
import type { MetricParams, Units } from '@/lib/units';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

const ALLOWED_OVERRIDES = new Set([
  'face_gain', 'face_lift_gain', 'face_coefficient', 'face_landmarks', 'solver_reg_weights',
  'feather_frac', 'field_blur_sigma', 'scale_smooth_iters', 'hand_contact_m',
  'fit_beta_regularizer', 'fit_num_aug', 'typical_results_text',
]);

/**
 * POST /api/admin/simulations/rerun   { simulationId, overrides?, targetWeightKg? }
 * Re-runs the same stored photo with adjusted settings. Stored as a new
 * simulation flagged admin_rerun; never shown to the patient.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  try {
    const body = (await request.json()) as { simulationId?: string; overrides?: Record<string, unknown>; targetWeightKg?: number };
    if (!body.simulationId) return NextResponse.json({ error: 'bad_request' }, { status: 400, headers: NO_STORE });

    const original = await prisma.simulation.findUnique({ where: { id: body.simulationId } });
    if (!original) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });

    const overrides: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body.overrides || {})) {
      if (ALLOWED_OVERRIDES.has(k)) overrides[k] = v;
    }

    const params = JSON.parse(original.paramsMetric) as MetricParams;
    if (typeof body.targetWeightKg === 'number' && body.targetWeightKg > 0) {
      params.target_weight_kg = body.targetWeightKg;
    } else {
      params.target_weight_kg = original.goalWeightKgRequested;
    }

    const sim = await createSimulation({
      userId: original.userId,
      cohort: 'admin_rerun',
      units: original.units as Units,
      params,
      existingPhotoId: original.photoId,
      overrides,
      rerunOfId: original.id,
    });

    const { ipAddress, userAgent } = getRequestInfo(request);
    await logAuditEvent({
      action: 'simulation_rerun',
      actor: session.user.email || undefined,
      actorId: session.user.id,
      actorRole: 'admin',
      targetId: sim.id,
      ipAddress,
      userAgent,
      details: { rerunOf: original.id, overrideKeys: Object.keys(overrides) },
      success: true,
    });

    return NextResponse.json({ simulationId: sim.id }, { status: 202, headers: NO_STORE });
  } catch (error) {
    if (error instanceof SimulatorError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.status, headers: NO_STORE });
    }
    console.error('[admin/simulations/rerun] error', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'internal' }, { status: 500, headers: NO_STORE });
  }
}
