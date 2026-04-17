'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized' ? 'You are not authorized to access the admin area.' : null
  );
  const [requires2FA, setRequires2FA] = useState(false);
  const [rememberBrowser, setRememberBrowser] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (requires2FA) {
        const result = await signIn('admin-login', { email, password, totpCode, redirect: false });
        if (result?.error) {
          setError(result.error === 'CredentialsSignin' || result.error === 'Configuration' ? 'Invalid 2FA code' : result.error);
        } else if (result?.ok) {
          fetch('/api/auth/log-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'login_success' }) }).catch(() => {});
          if (rememberBrowser) fetch('/api/auth/trust-browser', { method: 'POST' }).catch(() => {});
          router.push('/admin');
          router.refresh();
        }
        return;
      }

      const checkResponse = await fetch('/api/auth/check-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const checkResult = await checkResponse.json();

      if (!checkResult.success) {
        setError(checkResult.error || 'Invalid email or password');
        return;
      }

      if (checkResult.requires2FA) {
        setRequires2FA(true);
        return;
      }

      const result = await signIn('admin-login', { email, password, redirect: false });
      if (result?.error) {
        setError(result.error === 'CredentialsSignin' || result.error === 'Configuration' ? 'Invalid email or password' : result.error);
      } else if (result?.ok) {
        fetch('/api/auth/log-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'login_success' }) }).catch(() => {});
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2E2865] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!requires2FA ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="admin@infinity-u.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="--------" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Authentication Code</label>
                <input id="totpCode" type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                  autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent text-center text-2xl tracking-widest font-mono" placeholder="000000" />
                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code from your authenticator app</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberBrowser} onChange={(e) => setRememberBrowser(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#2E2865] focus:ring-[#2E2865]" />
                <span className="text-sm text-gray-700">Remember this browser for 30 days</span>
              </label>
              <button type="button" onClick={() => { setRequires2FA(false); setTotpCode(''); setRememberBrowser(false); }} className="text-sm text-[#2E2865] hover:underline">
                ← Back to login
              </button>
            </>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#2E2865] text-white font-medium rounded-lg hover:bg-[#231f50] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            {requires2FA ? 'Verify' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><RefreshCw className="h-8 w-8 text-[#2E2865] animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
