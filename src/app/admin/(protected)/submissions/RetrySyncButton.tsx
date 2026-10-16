'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/**
 * Force a re-push of a submission to AestheticIQ from the admin list. Works on
 * any entry regardless of current sync status (idempotent on the AestheticIQ
 * side), so it doubles as a backfill for submissions that never synced.
 */
export function RetrySyncButton({ submissionId, synced }: { submissionId: string; synced: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'running' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setState('running');
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/retry`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setState('idle');
      router.refresh();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Retry failed');
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={retry}
        disabled={state === 'running'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${state === 'running' ? 'animate-spin' : ''}`} />
        {state === 'running' ? 'Syncing…' : synced ? 'Re-sync' : 'Retry sync'}
      </button>
      {state === 'error' && error && <span className="text-red-600">{error}</span>}
    </span>
  );
}
