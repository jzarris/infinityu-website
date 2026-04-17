'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface SmsConsentRecord {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  consentType: string;
  consented: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  source: string;
  consentText: string;
  createdAt: string;
}

export default function SmsConsentsPage() {
  const [consents, setConsents] = useState<SmsConsentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [consentedFilter, setConsentedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchConsents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: '25' });
      if (search) params.set('search', search);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (consentedFilter !== 'all') params.set('consented', consentedFilter);
      const res = await fetch(`/api/admin/sms-consents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConsents(data.consents);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) { console.error('Failed to fetch consents:', err); }
    setLoading(false);
  }, [page, search, typeFilter, consentedFilter]);

  useEffect(() => { fetchConsents(); }, [fetchConsents]);

  const handleExport = () => {
    const params = new URLSearchParams({ export: 'csv' });
    if (search) params.set('search', search);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (consentedFilter !== 'all') params.set('consented', consentedFilter);
    window.open(`/api/admin/sms-consents?${params}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-[#2E2865]" />
          <h1 className="text-2xl font-bold text-gray-900">SMS Consents</h1>
          <span className="text-sm text-gray-500">({total} records)</span>
        </div>
        <button onClick={handleExport} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search email, phone, name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent">
          <option value="all">All Types</option>
          <option value="transactional">Transactional</option>
          <option value="marketing">Marketing</option>
        </select>
        <select value={consentedFilter} onChange={(e) => { setConsentedFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent">
          <option value="all">All</option>
          <option value="true">Opted In</option>
          <option value="false">Opted Out</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 text-gray-400 animate-spin" /></div>
      ) : consents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No SMS consent records found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Consent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {consents.map((consent) => {
                  const isExpanded = expandedRow === consent.id;
                  return (
                    <>
                      <tr key={consent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{new Date(consent.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-900">{[consent.firstName, consent.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{consent.email}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${consent.consentType === 'transactional' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{consent.consentType}</span></td>
                        <td className="px-4 py-3">{consent.consented ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{consent.source}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedRow(isExpanded ? null : consent.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${consent.id}-details`}>
                          <td colSpan={7} className="px-4 py-3 bg-gray-50">
                            <div className="text-xs space-y-1 text-gray-500">
                              <p><strong>Phone:</strong> {consent.phone || '—'}</p>
                              <p><strong>IP:</strong> {consent.ipAddress || '—'}</p>
                              <p><strong>Consent text:</strong> {consent.consentText}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800"><strong>TCPA Compliance:</strong> SMS consent records are immutable and cannot be modified or deleted. All records include the exact consent text shown, IP address, and timestamp for compliance verification.</p>
      </div>
    </div>
  );
}
