import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/authz';
import { getRequestInfo, logAuditEvent } from '@/lib/audit';
import { syncToAestheticIq, type AestheticIqAcknowledgment } from '@/lib/aestheticiq';

/**
 * POST /api/admin/submissions/:id/retry
 * Force a re-push of a stored submission to AestheticIQ, regardless of its
 * current sync status. Idempotent on the AestheticIQ side (keyed on the
 * submission's stable submittedAt timestamp), so re-pushing an already-synced
 * submission will not create duplicate notes/signatures. Doubles as the
 * backfill for submissions that predate the sync fix.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const submission = await prisma.questionnaireSubmission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const safeJsonArray = (value: string | null): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  let answers: Record<string, unknown> = {};
  try {
    answers = submission.answers ? JSON.parse(submission.answers) : {};
  } catch {
    answers = {};
  }

  let acknowledgments: AestheticIqAcknowledgment[] | undefined;
  try {
    acknowledgments = submission.acknowledgments ? JSON.parse(submission.acknowledgments) : undefined;
  } catch {
    acknowledgments = undefined;
  }

  const result = await syncToAestheticIq({
    firstName: submission.firstName,
    lastName: submission.lastName,
    email: submission.email,
    phone: submission.phone,
    dateOfBirth: submission.dateOfBirth,
    state: submission.state,
    biologicalSex: submission.biologicalSex ?? undefined,
    selectedGoals: safeJsonArray(submission.selectedGoals),
    eligibleProducts: safeJsonArray(submission.eligibleProducts),
    healthSummary: submission.healthSummary ?? '',
    answers,
    acknowledgments,
    submissionLanguage: submission.submissionLanguage,
    // Same stable timestamp the original push used, so AestheticIQ dedupes.
    timestamp: submission.submittedAt.toISOString(),
  });

  await prisma.questionnaireSubmission.update({
    where: { id },
    data: {
      crmSyncAttemptedAt: new Date(),
      crmSyncedAt: result.ok ? new Date() : null,
      crmSyncError: result.ok ? null : result.error,
    },
  });

  const { ipAddress, userAgent } = getRequestInfo(request);
  await logAuditEvent({
    action: result.ok ? 'intake_crm_sync_retried' : 'intake_crm_sync_failed',
    target: submission.email,
    ipAddress,
    userAgent,
    details: {
      submissionId: id,
      manualRetry: true,
      status: 'status' in result ? result.status : undefined,
      error: result.ok ? undefined : result.error,
    },
    success: result.ok,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
