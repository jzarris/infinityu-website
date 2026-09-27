'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, CheckCircle, AlertCircle, Loader2, Trash2, RefreshCw, Download, MessageSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { prepareImage } from './image-prep';
import { CM_PER_IN, LB_PER_KG, MIN_TARGET_BMI, bmi, type Units } from '@/lib/units';

type Cohort = 'pre_signup' | 'post_login';

interface Context {
  available: boolean;
  cohort: Cohort;
  consentGiven: boolean;
  prefill: { height_cm?: number; weight_kg?: number; age?: number; sex?: string };
  maxLossFraction: number;
  typicalResults: string;
  latestSimulation: { id: string; status: string } | null;
}

interface Consent {
  version: string;
  text: string;
  given: boolean;
}

interface Progress {
  stage: string;
  fraction: number;
  label: string;
}

interface Status {
  simulationId: string;
  status: 'pending' | 'done' | 'refused' | 'failed';
  display: { height: string; weight: string; target_weight: string; loss: string };
  goalCapped: boolean;
  notifyRequested?: boolean;
  progress?: Progress;
  images?: { original: string; outputs: Record<string, string> };
  userMessage?: string;
}

type Step = 'loading' | 'unavailable' | 'consent' | 'form' | 'processing' | 'result' | 'refused';

const RETAKE_TIPS = [
  'Prop your phone at hip height about 8 feet (2.5 m) away and use the timer.',
  'Face the camera with your whole body in frame, head to feet, with space above and below.',
  'Arms slightly away from your sides, fitted clothing, plain background, even light.',
  'Only you in the picture.',
];

interface FormState {
  units: Units;
  heightFt: string;
  heightIn: string;
  heightCm: string;
  weight: string;
  goal: string;
  sex: string;
  age: string;
}

function metricFromForm(f: FormState) {
  const height_cm =
    f.units === 'imperial'
      ? (Number(f.heightFt) * 12 + Number(f.heightIn || 0)) * CM_PER_IN
      : Number(f.heightCm);
  const toKg = (v: string) => (f.units === 'imperial' ? Number(v) / LB_PER_KG : Number(v));
  return { height_cm, weight_kg: toKg(f.weight), target_weight_kg: toKg(f.goal), sex: f.sex, age: Number(f.age) };
}

function convertUnits(f: FormState, to: Units): FormState {
  if (f.units === to) return f;
  const n = (v: string) => (v.trim() === '' ? NaN : Number(v));
  if (to === 'metric') {
    const inches = n(f.heightFt) * 12 + (n(f.heightIn) || 0);
    return {
      ...f,
      units: 'metric',
      heightCm: isNaN(inches) ? '' : String(Math.round(inches * CM_PER_IN)),
      weight: isNaN(n(f.weight)) ? '' : String(Math.round(n(f.weight) / LB_PER_KG)),
      goal: isNaN(n(f.goal)) ? '' : String(Math.round(n(f.goal) / LB_PER_KG)),
    };
  }
  const totalIn = n(f.heightCm) / CM_PER_IN;
  return {
    ...f,
    units: 'imperial',
    heightFt: isNaN(totalIn) ? '' : String(Math.floor(Math.round(totalIn) / 12)),
    heightIn: isNaN(totalIn) ? '' : String(Math.round(totalIn) % 12),
    weight: isNaN(n(f.weight)) ? '' : String(Math.round(n(f.weight) * LB_PER_KG)),
    goal: isNaN(n(f.goal)) ? '' : String(Math.round(n(f.goal) * LB_PER_KG)),
  };
}

/** Decode a data URL into a Blob without fetch(), which the site's CSP blocks for data: URLs. */
function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, comma);
  const mime = header.slice(5, header.indexOf(';')) || 'application/octet-stream';
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function SimulatorFlow({ cohort }: { cohort: Cohort }) {
  const [step, setStep] = useState<Step>('loading');
  const [ctx, setCtx] = useState<Context | null>(null);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState<FormState>({
    units: 'imperial', heightFt: '', heightIn: '', heightCm: '', weight: '', goal: '', sex: '', age: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [notify, setNotify] = useState<{ state: 'idle' | 'requested' | 'no_phone' | 'error'; phoneLastFour?: string }>({ state: 'idle' });
  const [busy, setBusy] = useState(false);
  const pollTimer = useRef<number | null>(null);
  const currentSimId = useRef<string | null>(null);
  const cameraInput = useRef<HTMLInputElement | null>(null);
  const libraryInput = useRef<HTMLInputElement | null>(null);

  const stopPolling = () => {
    if (pollTimer.current) window.clearTimeout(pollTimer.current);
    pollTimer.current = null;
  };

  const poll = useCallback(async (simulationId: string, startedAt: number) => {
    try {
      const res = await fetch('/api/simulate/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId }),
      });
      const data = (await res.json()) as Status & { error?: string };
      if (!res.ok) throw new Error(data.error || 'status failed');
      if (data.notifyRequested) setNotify((n) => (n.state === 'idle' ? { state: 'requested' } : n));
      if (data.status === 'done') {
        setStatus(data);
        setStep('result');
        currentSimId.current = null;
        return;
      }
      if (data.status === 'refused' || data.status === 'failed') {
        setStatus(data);
        setStep('refused');
        currentSimId.current = null;
        return;
      }
      if (data.progress) setProgress(data.progress);
      if (Date.now() - startedAt > 8 * 60 * 1000) {
        setError('This is taking longer than expected. You can ask to be texted when it is ready, or try again later.');
        setStep('form');
        return;
      }
      pollTimer.current = window.setTimeout(() => poll(simulationId, startedAt), 3000);
    } catch {
      setError('We lost contact with the simulator. Please try again.');
      setStep('form');
    }
  }, []);

  const startProcessing = useCallback((simulationId: string) => {
    currentSimId.current = simulationId;
    setProgress(null);
    setNotify({ state: 'idle' });
    setStep('processing');
    poll(simulationId, Date.now());
  }, [poll]);

  // Ask to be texted if the page is closed while a run is in progress.
  useEffect(() => {
    const onHide = () => {
      const id = currentSimId.current;
      if (!id || notify.state === 'requested') return;
      navigator.sendBeacon('/api/simulate/notify', new Blob([JSON.stringify({ simulationId: id })], { type: 'text/plain' }));
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [notify.state]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, k] = await Promise.all([
          fetch('/api/simulate/context').then((r) => r.json() as Promise<Context>),
          fetch('/api/simulate/consent').then((r) => r.json() as Promise<Consent>),
        ]);
        if (cancelled) return;
        setCtx(c);
        setConsent(k);
        const p = c.prefill || {};
        setForm((f) => {
          const seeded: FormState = { ...f, sex: p.sex || f.sex, age: p.age ? String(p.age) : f.age };
          if (p.height_cm) {
            const totalIn = Math.round(p.height_cm / CM_PER_IN);
            seeded.heightFt = String(Math.floor(totalIn / 12));
            seeded.heightIn = String(totalIn % 12);
            seeded.heightCm = String(Math.round(p.height_cm));
          }
          if (p.weight_kg) seeded.weight = String(Math.round(p.weight_kg * LB_PER_KG));
          return seeded;
        });
        if (!c.available) setStep('unavailable');
        else if (!k.given) setStep('consent');
        else if (c.latestSimulation && (c.latestSimulation.status === 'pending' || c.latestSimulation.status === 'done')) {
          // Resume: a run in progress, or the last finished result (e.g. arriving from the text).
          startProcessing(c.latestSimulation.id);
        } else setStep('form');
      } catch {
        if (!cancelled) setStep('unavailable');
      }
    })();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [startProcessing]);

  const onPickFile = async (f: File | null) => {
    setError(null);
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const acceptConsent = async () => {
    if (!consent) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/simulate/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: consent.version, agreed: true }),
      });
      if (!res.ok) throw new Error('consent failed');
      setConsent({ ...consent, given: true });
      setStep('form');
    } catch {
      setError('We could not record your consent. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const validate = (): string | null => {
    const m = metricFromForm(form);
    if (!(m.height_cm >= 120 && m.height_cm <= 230)) return 'Please enter your height.';
    if (!(m.weight_kg >= 30 && m.weight_kg <= 350)) return 'Please enter your current weight.';
    if (!(m.target_weight_kg > 0)) return 'Please enter a goal weight.';
    if (m.target_weight_kg >= m.weight_kg) return 'Your goal weight must be below your current weight.';
    if (bmi(m.target_weight_kg, m.height_cm) < MIN_TARGET_BMI) return 'That goal is below a healthy weight for your height. Please choose a higher goal.';
    if (!['female', 'male', 'other'].includes(m.sex)) return 'Please select a sex.';
    if (!(m.age >= 18 && m.age <= 100)) return 'Please enter your age.';
    if (!file) return 'Please take or choose a photo.';
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const prepared = await prepareImage(file!);
      const m = metricFromForm(form);
      const fd = new FormData();
      fd.append('photo', prepared, 'photo.jpg');
      fd.append('units', form.units);
      fd.append('height_cm', String(m.height_cm));
      fd.append('weight_kg', String(m.weight_kg));
      fd.append('target_weight_kg', String(m.target_weight_kg));
      fd.append('sex', m.sex);
      fd.append('age', String(m.age));
      const res = await fetch('/api/simulate', { method: 'POST', body: fd });
      const data = (await res.json()) as { simulationId?: string; message?: string; error?: string };
      if (!res.ok || !data.simulationId) throw new Error(data.message || 'The simulator could not start. Please try again.');
      startProcessing(data.simulationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const requestText = async () => {
    const id = currentSimId.current;
    if (!id) return;
    try {
      const res = await fetch('/api/simulate/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: id }),
      });
      const data = (await res.json()) as { ok: boolean; reason?: string; phoneLastFour?: string };
      if (data.ok) setNotify({ state: 'requested', phoneLastFour: data.phoneLastFour });
      else setNotify({ state: data.reason === 'no_phone' ? 'no_phone' : 'error' });
    } catch {
      setNotify({ state: 'error' });
    }
  };

  const resetToForm = () => {
    setStatus(null);
    setFile(null);
    setPreview(null);
    setProgress(null);
    currentSimId.current = null;
    setStep('form');
  };

  const deletePhoto = async () => {
    if (!status) return;
    if (!window.confirm('Delete this photo and the simulation? This cannot be undone.')) return;
    setBusy(true);
    try {
      await fetch('/api/simulate/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: status.simulationId }),
      });
      resetToForm();
    } finally {
      setBusy(false);
    }
  };

  // ---- render ----

  if (step === 'loading') {
    return <Centered><Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" /></Centered>;
  }

  if (step === 'unavailable') {
    return (
      <Centered>
        <h1 className="text-2xl font-bold mb-2">Body Simulator</h1>
        <p className="text-[var(--color-text-muted)]">The simulator is temporarily unavailable. Please check back later.</p>
      </Centered>
    );
  }

  if (step === 'consent' && consent) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <h1 className="text-2xl font-bold">Before you take a photo</h1>
          <div className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border)]">
            {consent.text}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Full details are in our privacy policy: <PrivacyLink />
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-sm">I have read and agree to the above.</span>
          </label>
          {error && <ErrorBox>{error}</ErrorBox>}
          <Button onClick={acceptConsent} disabled={!agreed} isLoading={busy}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'processing') {
    const pct = Math.max(3, Math.round((progress?.fraction ?? 0) * 100));
    const label = progress?.label ?? 'Starting up';
    const starting = !progress || progress.stage === 'starting';
    return (
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <h2 className="text-xl font-semibold">Generating your simulation</h2>
          <div>
            <div className="flex justify-between text-sm text-[var(--color-text-muted)] mb-1">
              <span>{label}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-3 w-full bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className={`h-full bg-[var(--color-primary)] rounded-full transition-all duration-700 ${starting ? 'animate-pulse' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {starting
                ? 'Starting up. The first run after a quiet period can take a couple of minutes before progress begins.'
                : 'Usually one to three minutes in total.'}
            </p>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            {notify.state === 'requested' ? (
              <p className="text-sm text-[var(--color-text)]">
                <MessageSquare className="inline h-4 w-4 mr-1 text-[var(--color-primary)]" />
                We&apos;ll text you{notify.phoneLastFour ? ` at ***-***-${notify.phoneLastFour}` : ''} when it&apos;s ready. You can close this page.
              </p>
            ) : notify.state === 'no_phone' ? (
              <p className="text-sm text-[var(--color-text-muted)]">We don&apos;t have a phone number on file, so please keep this page open.</p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button variant="outline" onClick={requestText} leftIcon={<MessageSquare className="h-4 w-4" />}>
                  Text me when it&apos;s ready
                </Button>
                <span className="text-sm text-[var(--color-text-muted)]">Don&apos;t want to wait? We&apos;ll send a text with a sign-in link.</span>
                {notify.state === 'error' && <span className="text-sm text-red-700">Could not set that up. Please keep this page open.</span>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'refused' && status) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold mb-2">We couldn&apos;t use that photo</h2>
              <p className="text-[var(--color-text-muted)]">{status.userMessage}</p>
            </div>
          </div>
          <Tips />
          <Button onClick={resetToForm} leftIcon={<Camera className="h-4 w-4" />}>Take another photo</Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'result' && status?.images) {
    const output = status.images.outputs.expected || Object.values(status.images.outputs)[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-[var(--color-success)]" />
          <h1 className="text-2xl font-bold">Your simulation</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <img src={status.images.original} alt="Your photo" className="w-full rounded-[var(--radius-md)]" />
            <figcaption className="text-center text-sm mt-2 text-[var(--color-text-muted)]">Today, {status.display.weight}</figcaption>
          </figure>
          <figure>
            <img src={output} alt="Simulation at goal weight" className="w-full rounded-[var(--radius-md)]" />
            <figcaption className="text-center text-sm mt-2 text-[var(--color-text-muted)]">Simulation at {status.display.target_weight} ({status.display.loss})</figcaption>
          </figure>
        </div>
        <div className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 space-y-2">
          <p><strong>This is a simulation, not a photograph of results.</strong> It is a computer-generated estimate based on your photo and the numbers you entered. Real results vary from person to person.</p>
          <p>{ctx?.typicalResults}</p>
          {status.goalCapped && <p>Your goal was shown at the program&apos;s typical outcome rather than the number you entered.</p>}
          <p>Medical services are provided independently by licensed medical providers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => downloadDataUrl(output, 'meltawaymd-simulation.png')} leftIcon={<Download className="h-4 w-4" />}>
            Download simulation
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadDataUrl(status.images!.original, status.images!.original.startsWith('data:image/png') ? 'meltawaymd-original.png' : 'meltawaymd-original.jpg')}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download original
          </Button>
          {cohort === 'post_login' ? (
            <Link href="/portal"><Button variant="outline">Back to portal</Button></Link>
          ) : (
            <Link href="/"><Button variant="outline">Done</Button></Link>
          )}
          <Button variant="ghost" onClick={resetToForm} leftIcon={<RefreshCw className="h-4 w-4" />}>Try another photo</Button>
          <Button variant="ghost" onClick={deletePhoto} isLoading={busy} leftIcon={<Trash2 className="h-4 w-4" />}>Delete my photo</Button>
        </div>
      </div>
    );
  }

  // ---- form ----
  const imperial = form.units === 'imperial';
  const capPct = Math.round((ctx?.maxLossFraction ?? 0.2) * 100);
  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Body Simulator</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Take one full-body photo and enter a goal weight to see a simulation. Nothing is generated until you press Simulate.</p>
        </div>

        <Tips />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Units</span>
          <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
            {(['imperial', 'metric'] as Units[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm((f) => convertUnits(f, u))}
                className={`px-3 py-1.5 text-sm ${form.units === u ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-muted)]'}`}
              >
                {u === 'imperial' ? 'lb / ft-in' : 'kg / cm'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {imperial ? (
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <div className="flex gap-2">
                <Num value={form.heightFt} onChange={(v) => setForm({ ...form, heightFt: v })} placeholder="ft" />
                <Num value={form.heightIn} onChange={(v) => setForm({ ...form, heightIn: v })} placeholder="in" />
              </div>
            </div>
          ) : (
            <Field label="Height (cm)"><Num value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} placeholder="cm" /></Field>
          )}
          <Field label={`Current weight (${imperial ? 'lb' : 'kg'})`}><Num value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} /></Field>
          <Field label={`Goal weight (${imperial ? 'lb' : 'kg'})`} hint={`Goals more than ${capPct}% below your current weight are shown at ${capPct}%, the program's typical outcome.`}>
            <Num value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} />
          </Field>
          <Field label="Age"><Num value={form.age} onChange={(v) => setForm({ ...form, age: v })} /></Field>
          <Field label="Sex">
            <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={inputClass}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your photo</label>
          {/* Two inputs: `capture` forces the camera on phones, so the library needs its own. */}
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { onPickFile(e.target.files?.[0] || null); e.target.value = ''; }}
            className="hidden"
          />
          <input
            ref={libraryInput}
            type="file"
            accept="image/*"
            onChange={(e) => { onPickFile(e.target.files?.[0] || null); e.target.value = ''; }}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => cameraInput.current?.click()} leftIcon={<Camera className="h-4 w-4" />}>
              Take a photo
            </Button>
            <Button type="button" variant="outline" onClick={() => libraryInput.current?.click()} leftIcon={<Upload className="h-4 w-4" />}>
              Choose from library
            </Button>
            {file && <span className="text-sm text-[var(--color-text-muted)]">{file.name}</span>}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Your photo is stored encrypted, used only for your simulation, and deleted automatically.{' '}
            <PrivacyLink />
          </p>
          {preview && <img src={preview} alt="Selected photo" className="mt-3 max-h-80 rounded-[var(--radius-md)]" />}
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Button onClick={submit} isLoading={busy} leftIcon={<Camera className="h-4 w-4" />}>Simulate</Button>
      </CardContent>
    </Card>
  );
}

const inputClass = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent';

function Num({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="number" inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function PrivacyLink() {
  return (
    <a
      href="/privacy#body-simulator-photos"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] hover:underline"
    >
      How we handle your photo
    </a>
  );
}

function Tips() {
  return (
    <ul className="text-sm text-[var(--color-text-muted)] list-disc pl-5 space-y-1">
      {RETAKE_TIPS.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-700">{children}</div>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center text-center py-16">{children}</div>;
}
