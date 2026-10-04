import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import {
  FileText, Calendar, User, Mail, Phone, Target,
  CheckCircle, XCircle, Globe, ChevronLeft, ChevronRight, ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Management',
  anti_aging: 'Anti-Aging & Longevity',
  energy_wellness: 'Energy & Wellness',
  recovery_healing: 'Recovery & Healing',
  cognitive_mood: 'Cognitive & Mood Support',
};

const PRODUCT_LABELS: Record<string, string> = {
  tirzepatide: 'GLP-1/GIP Therapy',
  semaglutide: 'GLP-1 Therapy',
  aod9604: 'Fat Metabolism Peptide',
  lipo_b: 'Lipotropic Injection',
  nad_plus: 'NAD+ Therapy',
  sermorelin: 'Growth Hormone Peptide',
  glutathione: 'Antioxidant Therapy',
  mots_c: 'Metabolic Peptide',
  ghk_cu: 'Copper Peptide',
  bpc157_tb500: 'Healing Peptides',
  semax_selank: 'Cognitive Peptides',
};

const LANG_LABELS: Record<string, string> = { en: 'English', th: 'Thai', es: 'Spanish' };

const PAGE_SIZE = 20;

async function getSubmissions(page: number) {
  const skip = (page - 1) * PAGE_SIZE;
  const [rows, total] = await Promise.all([
    prisma.questionnaireSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
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
        eligibleProducts: true,
        ineligibleProducts: true,
        healthSummary: true,
        acknowledgments: true,
        submissionLanguage: true,
        languagesUsed: true,
        submittedAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.questionnaireSubmission.count(),
  ]);

  return {
    submissions: rows.map((s) => ({
      ...s,
      selectedGoals:      JSON.parse(s.selectedGoals) as string[],
      eligibleProducts:   JSON.parse(s.eligibleProducts) as string[],
      ineligibleProducts: JSON.parse(s.ineligibleProducts) as { productId: string; reason: string }[],
      languagesUsed:      JSON.parse(s.languagesUsed) as string[],
      acknowledgments:    s.acknowledgments
        ? (JSON.parse(s.acknowledgments) as {
            id: string; version: string; title: string;
            text: string; checkboxLabel: string; acceptedAt: string;
          }[])
        : null,
    })),
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const { submissions, total, totalPages } = await getSubmissions(page);

  return (
    <div className="py-4 sm:py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Health Assessment Submissions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} total submission{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">
                When patients complete the health assessment, their submissions will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((s) => {
              const name = `${s.firstName} ${s.lastName}`.trim();
              const initial = name[0]?.toUpperCase() || '?';
              const nonEnglish = s.submissionLanguage !== 'en';

              return (
                <Card key={s.id}>
                  <CardContent className="p-5 sm:p-6">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-[#2E2865] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-base">{initial}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{s.email}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              {s.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 pl-14 sm:pl-0">
                        <p className="text-xs text-gray-500 flex items-center sm:justify-end gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.submittedAt).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                        </p>
                        {s.user && (
                          <p className="text-xs text-green-600 mt-1 font-medium">Patient linked</p>
                        )}
                      </div>
                    </div>

                    {/* ── Contact & Goals ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" /> Contact Details
                        </h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex gap-2">
                            <dt className="text-gray-400 w-10 flex-shrink-0">DOB</dt>
                            <dd className="text-gray-800">{s.dateOfBirth}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-gray-400 w-10 flex-shrink-0">State</dt>
                            <dd className="text-gray-800">{s.state}</dd>
                          </div>
                          {s.biologicalSex && (
                            <div className="flex gap-2">
                              <dt className="text-gray-400 w-10 flex-shrink-0">Sex</dt>
                              <dd className="text-gray-800 capitalize">{s.biologicalSex}</dd>
                            </div>
                          )}
                          {nonEnglish && (
                            <div className="flex gap-2 items-center">
                              <dt className="text-gray-400 w-10 flex-shrink-0 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                              </dt>
                              <dd>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  {LANG_LABELS[s.submissionLanguage] ?? s.submissionLanguage}
                                </span>
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" /> Wellness Goals
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {s.selectedGoals.map((g) => (
                            <span key={g} className="px-2.5 py-1 bg-[#2E2865]/8 text-[#2E2865] text-xs rounded-full font-medium border border-[#2E2865]/20">
                              {GOAL_LABELS[g] ?? g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── Eligibility ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Potentially Eligible
                        </h4>
                        {s.eligibleProducts.length > 0 ? (
                          <ul className="space-y-1 text-sm text-gray-700">
                            {s.eligibleProducts.map((p) => (
                              <li key={p} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {PRODUCT_LABELS[p] ?? p}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400">None identified</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" /> Not Eligible
                        </h4>
                        {s.ineligibleProducts.length > 0 ? (
                          <ul className="space-y-2 text-sm">
                            {s.ineligibleProducts.map((item) => (
                              <li key={item.productId}>
                                <span className="flex items-center gap-1.5 text-gray-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                  {PRODUCT_LABELS[item.productId] ?? item.productId}
                                </span>
                                <p className="text-xs text-gray-400 ml-3">{item.reason}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400">None identified</p>
                        )}
                      </div>
                    </div>

                    {/* ── Health Summary ── */}
                    {s.healthSummary && (
                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Health Summary
                        </h4>
                        <pre className="text-xs bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-gray-600 leading-relaxed">
                          {s.healthSummary}
                        </pre>
                      </div>
                    )}

                    {/* ── Acknowledgments ── */}
                    {s.acknowledgments && s.acknowledgments.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Acknowledgments
                        </h4>
                        <div className="space-y-3">
                          {s.acknowledgments.map((ack) => (
                            <div key={ack.id} className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-800">{ack.title}</span>
                                <span className="text-xs text-gray-400">
                                  v{ack.version} · accepted {new Date(ack.acceptedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{ack.text}</p>
                              <p className="text-xs font-medium text-gray-700 border-t border-gray-200 pt-2">
                                ☑ {ack.checkboxLabel}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      <span>ID: {s.id}</span>
                      {!s.acknowledgments && (
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
                          No ack
                        </span>
                      )}
                      {s.languagesUsed.length > 1 && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                          Multi-language session
                        </span>
                      )}
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            {page > 1 ? (
              <Link
                href={`/admin/submissions?page=${page - 1}`}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-sm text-gray-300 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" /> Previous
              </span>
            )}
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            {page < totalPages ? (
              <Link
                href={`/admin/submissions?page=${page + 1}`}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-sm text-gray-300 cursor-not-allowed">
                Next <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
