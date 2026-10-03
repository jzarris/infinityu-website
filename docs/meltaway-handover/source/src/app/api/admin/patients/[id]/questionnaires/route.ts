import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/authz';
import { errorResponse } from '@/lib/api-utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/patients/[id]/questionnaires
 * Get all questionnaire submissions for a patient
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAdminApi();
    if (session instanceof NextResponse) return session;

    const { id } = await context.params;

    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id, role: 'patient' },
      select: { id: true, email: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all questionnaire submissions for this patient
    // Match by userId OR email (for submissions before account creation)
    const questionnaires = await prisma.questionnaireSubmission.findMany({
      where: {
        OR: [
          { userId: id },
          { email: patient.email || '' },
        ],
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        state: true,
        biologicalSex: true,
        selectedGoals: true,
        answers: true,
        eligibleProducts: true,
        ineligibleProducts: true,
        healthSummary: true,
        acknowledgments: true,
        submittedAt: true,
        zohoContactId: true,
        zohoLeadId: true,
        zohoSyncedAt: true,
      },
    });

    // Parse JSON fields for response
    const parsedQuestionnaires = questionnaires.map((q) => ({
      ...q,
      selectedGoals: JSON.parse(q.selectedGoals),
      answers: JSON.parse(q.answers),
      eligibleProducts: JSON.parse(q.eligibleProducts),
      ineligibleProducts: JSON.parse(q.ineligibleProducts),
      acknowledgments: q.acknowledgments ? JSON.parse(q.acknowledgments) : [],
    }));

    return NextResponse.json({ questionnaires: parsedQuestionnaires });
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    return errorResponse(error, 'Failed to fetch questionnaires');
  }
}
