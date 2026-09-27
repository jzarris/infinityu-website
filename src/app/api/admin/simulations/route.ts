import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/authz';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * POST /api/admin/simulations   { search?, userId?, limit? }
 * Recent simulations across patients, or for one patient.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const body = (await request.json().catch(() => ({}))) as { search?: string; userId?: string; limit?: number };
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 200);

  const where: Record<string, unknown> = { deletedAt: null };
  if (body.userId) where.userId = body.userId;
  if (body.search) {
    where.user = {
      OR: [
        { name: { contains: body.search, mode: 'insensitive' } },
        { email: { contains: body.search, mode: 'insensitive' } },
      ],
    };
  }

  const sims = await prisma.simulation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, cohort: true, units: true, status: true, createdAt: true, completedAt: true,
      goalWeightKgRequested: true, goalWeightKgApplied: true, paramsDisplay: true, modelVersion: true,
      refusalReasons: true, rerunOfId: true, photoId: true,
      user: { select: { id: true, name: true, email: true } },
      photo: { select: { status: true, retentionAt: true, width: true, height: true } },
    },
  });

  return NextResponse.json(
    {
      simulations: sims.map((s) => ({
        ...s,
        paramsDisplay: JSON.parse(s.paramsDisplay),
        refusalReasons: s.refusalReasons ? JSON.parse(s.refusalReasons) : [],
      })),
    },
    { headers: NO_STORE }
  );
}
