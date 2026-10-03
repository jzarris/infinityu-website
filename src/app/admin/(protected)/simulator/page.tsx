'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera, RefreshCw, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Row {
  id: string;
  cohort: string;
  units: string;
  status: string;
  createdAt: string;
  goalWeightKgRequested: number;
  goalWeightKgApplied: number;
  paramsDisplay: { height: string; weight: string; target_weight: string; loss: string };
  modelVersion: string | null;
  refusalReasons: string[];
  rerunOfId: string | null;
  photoId: string;
  user: { id: string; name: string | null; email: string | null };
  photo: { status: string; retentionAt: string };
}

interface Detail {
  simulation: Row & {
    paramsMetric: Record<string, unknown>;
    diagnostics: Record<string, unknown> | null;
    configOverrides: Record<string, unknown> | null;
    userMessage: string | null;
    completedAt: string | null;
    photo: { id: string; status: string; refusalReasons: string | null; retentionAt: string; width: number; height: number; capturedAt: string };
  };
  images: { original: string; outputs: Record<string, string> } | null;
}

interface SimSettings {
  simulator_enabled: boolean;
  simulator_typical_results: string;
  simulator_max_loss_fraction: number;
  simulator_retention_days_lead: number;
  simulator_retention_days_patient: number;
}

const KEY_DIAGNOSTICS: Array<[string, (d: Record<string, unknown>) => unknown]> = [
  ['Fit uncertainty (mm)', (d) => get(d, 'fit.mean_vertex_uncertainty_mm')],
  ['Implied / stated weight', (d) => get(d, 'measure.implied_over_stated')],
  ['Mask coverage', (d) => get(d, 'mask_coverage')],
  ['Waist change (cm)', (d) => get(d, 'variants.expected.waist_change_cm')],
  ['Waist cm per kg', (d) => get(d, 'variants.expected.waist_cm_per_kg')],
  ['Max displacement (px)', (d) => get(d, 'variants.expected.max_displacement_px')],
  ['Inpainter', (d) => get(d, 'variants.expected.inpainter')],
  ['Face landmarks', (d) => get(d, 'face.landmarks')],
  ['Warnings', (d) => (get(d, 'warnings') as string[] | undefined)?.join(', ') || 'none'],
  ['Refusals', (d) => (get(d, 'refusals') as string[] | undefined)?.join(', ') || 'none'],
  ['Total time (s)', (d) => get(d, 'total_s')],
];

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export default function AdminSimulatorPage() {
  const [settings, setSettings] = useState<SimSettings | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rerun, setRerun] = useState({ face_gain: '', face_lift_gain: '', girth: false });
  const [unlockPhone, setUnlockPhone] = useState('');

  const doUnlock = async () => {
    const res = await fetch('/api/admin/security/otp-unlock', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: unlockPhone }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Unlocked (${data.cleared} limit${data.cleared === 1 ? '' : 's'} cleared)` : data.error || 'Unlock failed');
    setTimeout(() => setMessage(null), 4000);
  };

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings({
      simulator_enabled: !!data.simulator_enabled,
      simulator_typical_results: data.simulator_typical_results || '',
      simulator_max_loss_fraction: data.simulator_max_loss_fraction ?? 0.2,
      simulator_retention_days_lead: data.simulator_retention_days_lead ?? 30,
      simulator_retention_days_patient: data.simulator_retention_days_patient ?? 365,
    });
  }, []);

  const loadRows = useCallback(async (q: string) => {
    const res = await fetch('/api/admin/simulations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ search: q || undefined, limit: 100 }),
    });
    const data = await res.json();
    setRows(data.simulations || []);
  }, []);

  useEffect(() => {
    loadSettings();
    // Arriving from a patient row: /admin/simulator?search=<email>
    const initial = new URLSearchParams(window.location.search).get('search') || '';
    setSearch(initial);
    loadRows(initial);
  }, [loadSettings, loadRows]);

  const saveSetting = async (key: keyof SimSettings, value: unknown) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }),
    });
    setMessage(res.ok ? 'Saved' : 'Save failed');
    setTimeout(() => setMessage(null), 2500);
    loadSettings();
  };

  const view = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/simulations/view', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ simulationId: id }),
      });
      setSelected(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const doRerun = async () => {
    if (!selected) return;
    const overrides: Record<string, unknown> = {};
    if (rerun.face_gain) overrides.face_gain = Number(rerun.face_gain);
    if (rerun.face_lift_gain) overrides.face_lift_gain = Number(rerun.face_lift_gain);
    if (rerun.girth) overrides.solver_reg_weights = [1, 0.33, 1, 1, 1, 1, 1, 1, 1, 1];
    setLoading(true);
    try {
      const res = await fetch('/api/admin/simulations/rerun', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: selected.simulation.id, overrides }),
      });
      const data = await res.json();
      setMessage(res.ok ? `Re-run started (${data.simulationId}). Refresh the list in about a minute.` : data.message || 'Re-run failed');
      loadRows(search);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (payload: { simulationId?: string; photoId?: string }) => {
    if (!window.confirm('Delete permanently? This removes the stored images.')) return;
    await fetch('/api/admin/simulations/delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    setSelected(null);
    loadRows(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Camera className="h-6 w-6 text-[var(--color-primary)]" />
        <h1 className="text-2xl font-bold">Body Simulator</h1>
        {message && <span className="text-sm text-[var(--color-text-muted)]">{message}</span>}
      </div>

      {settings && (
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.simulator_enabled} onChange={(e) => saveSetting('simulator_enabled', e.target.checked)} />
              <span className="font-medium">Enabled</span>
              <span className="text-sm text-[var(--color-text-muted)]">Kill switch. Off hides the feature within a minute.</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Typical results text (burned into every image)</label>
              <input className={inputClass} defaultValue={settings.simulator_typical_results} onBlur={(e) => saveSetting('simulator_typical_results', e.target.value)} placeholder="Typical results: X lb over Y weeks (source)" />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Must be substantiated before launch. Empty shows a placeholder.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal cap (fraction of weight)</label>
                <input className={inputClass} type="number" step="0.01" min="0.05" max="0.35" defaultValue={settings.simulator_max_loss_fraction} onBlur={(e) => saveSetting('simulator_max_loss_fraction', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Retention, leads (days)</label>
                <input className={inputClass} type="number" defaultValue={settings.simulator_retention_days_lead} onBlur={(e) => saveSetting('simulator_retention_days_lead', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Retention, patients (days)</label>
                <input className={inputClass} type="number" defaultValue={settings.simulator_retention_days_patient} onBlur={(e) => saveSetting('simulator_retention_days_patient', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Unlock a phone number</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            Five wrong codes in 15 minutes locks a number for 30 minutes; three code sends in 15 minutes locks it for an hour. Clear it here for a person who is stuck.
          </p>
          <div className="flex gap-2 max-w-md">
            <input className={inputClass} placeholder="Phone number" value={unlockPhone} onChange={(e) => setUnlockPhone(e.target.value)} />
            <Button variant="outline" onClick={doUnlock}>Unlock</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input className={inputClass} placeholder="Search patient name or email" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadRows(search)} />
            <Button variant="outline" onClick={() => loadRows(search)} leftIcon={<Search className="h-4 w-4" />}>Search</Button>
            <Button variant="ghost" onClick={() => loadRows(search)} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                  <th className="py-2 pr-3">Date</th><th className="pr-3">Patient</th><th className="pr-3">Cohort</th><th className="pr-3">Goal</th><th className="pr-3">Status</th><th className="pr-3">Model</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--color-border)]">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="pr-3">{r.user.name || '—'}<div className="text-xs text-[var(--color-text-muted)]">{r.user.email}</div></td>
                    <td className="pr-3">{r.cohort}{r.rerunOfId ? ' (re-run)' : ''}</td>
                    <td className="pr-3 whitespace-nowrap">{r.paramsDisplay.weight} → {r.paramsDisplay.target_weight}{Math.abs(r.goalWeightKgApplied - r.goalWeightKgRequested) > 1e-6 ? ' (capped)' : ''}</td>
                    <td className="pr-3">{r.status}{r.refusalReasons.length ? `: ${r.refusalReasons.join(', ')}` : ''}</td>
                    <td className="pr-3">{r.modelVersion || '—'}</td>
                    <td><Button size="sm" variant="outline" onClick={() => view(r.id)}>View</Button></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-[var(--color-text-muted)]">No simulations</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation {selected.simulation.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm grid sm:grid-cols-2 gap-x-6 gap-y-1">
              <div><span className="text-[var(--color-text-muted)]">Patient:</span> {selected.simulation.user.name} ({selected.simulation.user.email})</div>
              <div><span className="text-[var(--color-text-muted)]">Cohort:</span> {selected.simulation.cohort}</div>
              <div><span className="text-[var(--color-text-muted)]">Entered:</span> {selected.simulation.paramsDisplay.height}, {selected.simulation.paramsDisplay.weight} → {selected.simulation.paramsDisplay.target_weight} ({selected.simulation.units})</div>
              <div><span className="text-[var(--color-text-muted)]">Goal applied:</span> {selected.simulation.goalWeightKgApplied.toFixed(1)} kg (requested {selected.simulation.goalWeightKgRequested.toFixed(1)} kg)</div>
              <div><span className="text-[var(--color-text-muted)]">Status:</span> {selected.simulation.status}</div>
              <div><span className="text-[var(--color-text-muted)]">Photo:</span> {selected.simulation.photo.width}×{selected.simulation.photo.height}, {selected.simulation.photo.status}, expires {new Date(selected.simulation.photo.retentionAt).toLocaleDateString()}</div>
              {selected.simulation.userMessage && <div className="sm:col-span-2"><span className="text-[var(--color-text-muted)]">Message shown:</span> {selected.simulation.userMessage}</div>}
            </div>

            {selected.images && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <figure><img src={selected.images.original} alt="original" className="w-full rounded" /><figcaption className="text-xs text-center mt-1">original</figcaption></figure>
                {Object.entries(selected.images.outputs).map(([name, src]) => (
                  <figure key={name}><img src={src} alt={name} className="w-full rounded" /><figcaption className="text-xs text-center mt-1">{name}</figcaption></figure>
                ))}
              </div>
            )}

            {selected.simulation.diagnostics && (
              <div>
                <h3 className="font-semibold mb-2">Diagnostics</h3>
                <table className="text-sm">
                  <tbody>
                    {KEY_DIAGNOSTICS.map(([label, fn]) => (
                      <tr key={label}><td className="pr-4 py-0.5 text-[var(--color-text-muted)]">{label}</td><td>{String(fn(selected.simulation.diagnostics!) ?? '—')}</td></tr>
                    ))}
                  </tbody>
                </table>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-[var(--color-primary)]">Full record</summary>
                  <pre className="text-xs bg-[var(--color-surface)] p-3 rounded overflow-x-auto max-h-96">{JSON.stringify(selected.simulation.diagnostics, null, 2)}</pre>
                </details>
              </div>
            )}

            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="font-semibold mb-2">Re-run with adjusted settings</h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div><label className="block text-xs mb-1">Face gain (default 0.8)</label><input className={inputClass} value={rerun.face_gain} onChange={(e) => setRerun({ ...rerun, face_gain: e.target.value })} placeholder="0.8" /></div>
                <div><label className="block text-xs mb-1">Face lift gain (default 0.45)</label><input className={inputClass} value={rerun.face_lift_gain} onChange={(e) => setRerun({ ...rerun, face_lift_gain: e.target.value })} placeholder="0.45" /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rerun.girth} onChange={(e) => setRerun({ ...rerun, girth: e.target.checked })} /> Trunk-heavy distribution</label>
                <Button onClick={doRerun} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>Re-run</Button>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Re-runs are stored as separate simulations and never shown to the patient.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => remove({ simulationId: selected.simulation.id })} leftIcon={<Trash2 className="h-4 w-4" />}>Delete this simulation</Button>
              <Button variant="outline" onClick={() => remove({ photoId: selected.simulation.photoId })} leftIcon={<Trash2 className="h-4 w-4" />}>Delete photo and all its simulations</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-sm';
