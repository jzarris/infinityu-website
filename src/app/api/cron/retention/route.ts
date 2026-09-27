import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { runRetentionSweep } from '@/lib/simulator-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/retention
 * Deletes expired photos and outputs and runs the audit-log and trusted-browser
 * cleanups. Call daily from a Railway cron (or any scheduler) with
 * header `x-cron-secret: $CRON_SECRET`. The app also runs this opportunistically
 * about once an hour when the simulator is used.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.CRON_SECRET || '';
  const given = request.headers.get('x-cron-secret') || '';
  const ok =
    expected.length > 0 &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const result = await runRetentionSweep();
  return NextResponse.json({ success: true, ...result });
}
