import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/authz';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const [submissions, total] = await Promise.all([
    prisma.questionnaireSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        state: true,
        selectedGoals: true,
        eligibleProducts: true,
        acknowledgments: true,
        submittedAt: true,
        submissionLanguage: true,
      },
    }),
    prisma.questionnaireSubmission.count(),
  ]);

  return NextResponse.json({
    submissions: submissions.map((s) => ({
      ...s,
      selectedGoals: JSON.parse(s.selectedGoals),
      eligibleProducts: JSON.parse(s.eligibleProducts),
      acknowledgments: s.acknowledgments ? JSON.parse(s.acknowledgments) : null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
