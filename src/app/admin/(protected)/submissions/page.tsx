'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface AcknowledgmentRecord {
  id: string;
  version: string;
  title: string;
  text: string;
  checkboxLabel: string;
  acceptedAt: string;
}

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  selectedGoals: string[];
  eligibleProducts: string[];
  acknowledgments: AcknowledgmentRecord[] | null;
  submittedAt: string;
  submissionLanguage: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) { console.error('Failed to fetch submissions:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubmissions(page); }, [fetchSubmissions, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Intake Submissions</h1>
          {!loading && <span className="text-sm text-gray-500">({total} total)</span>}
        </div>
        <button onClick={() => fetchSubmissions(page)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No submissions yet.</div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                    <span className="ml-2 text-sm text-gray-500">{s.email}</span>
                  </div>
                  {s.acknowledgments && s.acknowledgments.length > 0 ? (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">Ack signed</span>
                  ) : (
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-2 py-0.5">No ack</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{new Date(s.submittedAt).toLocaleString()}</span>
              </button>

              {expanded === s.id && (
                <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{s.phone}</span></div>
                    <div><span className="text-gray-500">State:</span> <span className="text-gray-900">{s.state}</span></div>
                    <div><span className="text-gray-500">Goals:</span> <span className="text-gray-900">{s.selectedGoals.join(', ')}</span></div>
                    <div><span className="text-gray-500">Eligible:</span> <span className="text-gray-900">{s.eligibleProducts.join(', ') || 'none'}</span></div>
                    <div><span className="text-gray-500">Language:</span> <span className="text-gray-900">{s.submissionLanguage}</span></div>
                  </div>

                  {s.acknowledgments && s.acknowledgments.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Acknowledgments</h3>
                      {s.acknowledgments.map((ack) => (
                        <div key={ack.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">{ack.title}</span>
                            <span className="text-xs text-gray-500">v{ack.version} · accepted {new Date(ack.acceptedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{ack.text}</p>
                          <p className="text-xs font-medium text-gray-700 border-t border-gray-200 pt-2">☑ {ack.checkboxLabel}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                      No acknowledgment recorded for this submission.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
