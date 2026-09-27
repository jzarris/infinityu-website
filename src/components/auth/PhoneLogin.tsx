'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function PhoneLogin() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not send a code.');
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated) throw new Error(data.error || 'That code did not work.');
      router.push('/simulate');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-16 md:py-24">
      <div className="container-custom max-w-md">
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-7 w-7 text-[var(--color-primary)]" />
              </div>
              <h1 className="text-2xl font-bold">Sign in with your phone</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {step === 'phone'
                  ? 'Use the phone number you verified during your health assessment.'
                  : 'Enter the 6-digit code we sent to your phone.'}
              </p>
            </div>

            {step === 'phone' ? (
              <>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-md)] text-lg"
                />
                {error && <p className="text-sm text-red-700">{error}</p>}
                <Button className="w-full" onClick={sendCode} isLoading={busy} disabled={phone.replace(/\D/g, '').length < 10}>
                  Send code
                </Button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-[var(--color-border)] rounded-[var(--radius-md)]"
                  autoFocus
                />
                {error && <p className="text-sm text-red-700">{error}</p>}
                <Button className="w-full" onClick={verify} isLoading={busy} disabled={code.length !== 6}>
                  Sign in
                </Button>
                <button type="button" className="w-full text-sm text-[var(--color-text-muted)] hover:underline" onClick={() => { setStep('phone'); setCode(''); }}>
                  Use a different number
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
