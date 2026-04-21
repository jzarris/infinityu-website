'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string | null;
  actorId: string | null;
  actorRole: string | null;
  target: string | null;
  ipAddress: string | null;
  country: string | null;
  userAgent: string | null;
  details: string | null;
  success: boolean;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  login_success: { label: 'Login Success', color: 'bg-green-50 text-green-700' },
  login_failed: { label: 'Login Failed', color: 'bg-red-50 text-red-700' },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-600' },
  unauthorized_access: { label: 'Unauthorized', color: 'bg-red-50 text-red-700' },
  password_change: { label: 'Password Changed', color: 'bg-blue-50 text-blue-700' },
  password_set: { label: 'Password Set', color: 'bg-blue-50 text-blue-700' },
  totp_enabled: { label: '2FA Enabled', color: 'bg-green-50 text-green-700' },
  totp_disabled: { label: '2FA Disabled', color: 'bg-yellow-50 text-yellow-700' },
  setting_updated: { label: 'Setting Updated', color: 'bg-blue-50 text-blue-700' },
  setting_removed: { label: 'Setting Removed', color: 'bg-yellow-50 text-yellow-700' },
  trusted_browser_added: { label: 'Browser Trusted', color: 'bg-green-50 text-green-700' },
  trusted_browser_revoked: { label: 'Browser Revoked', color: 'bg-yellow-50 text-yellow-700' },
  user_created: { label: 'User Created', color: 'bg-green-50 text-green-700' },
  user_updated: { label: 'User Updated', color: 'bg-blue-50 text-blue-700' },
  user_deleted: { label: 'User Deleted', color: 'bg-red-50 text-red-700' },
  contact_form_submitted: { label: 'Contact Form', color: 'bg-purple-50 text-purple-700' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: '50' });
      if (search) params.set('search', search);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (successFilter !== 'all') params.set('success', successFilter);
      const res = await fetch(`/api/admin/audit-log?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) { console.error('Failed to fetch logs:', err); }
    setLoading(false);
  }, [page, search, actionFilter, successFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = () => {
    const params = new URLSearchParams({ export: 'csv' });
    if (search) params.set('search', search);
    if (actionFilter !== 'all') params.set('action', actionFilter);
    if (successFilter !== 'all') params.set('success', successFilter);
    window.open(`/api/admin/audit-log?${params}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[#2E2865]" />
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <span className="text-sm text-gray-500">({total} events)</span>
        </div>
        <button onClick={handleExport} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search actor, target, IP..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent">
          <option value="all">All Actions</option>
          {Object.entries(actionLabels).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select value={successFilter} onChange={(e) => { setSuccessFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent">
          <option value="all">All Results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 text-gray-400 animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No audit log entries found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600' };
                  const isExpanded = expandedRow === log.id;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>{actionInfo.label}</span></td>
                      <td className="px-4 py-3 text-gray-600">{log.actor || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{log.ipAddress || '—'}{log.country ? ` (${log.country})` : ''}</td>
                      <td className="px-4 py-3">{log.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedRow(isExpanded ? null : log.id)} className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
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

      <p className="mt-4 text-xs text-gray-400">Audit logs are retained for 90 days and automatically deleted after expiration.</p>
    </div>
  );
}
