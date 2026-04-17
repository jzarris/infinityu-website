'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function SecurityPage() {
  const [status, setStatus] = useState<{ email: string; passwordSet: boolean; totpEnabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // TOTP state
  const [totpSetup, setTotpSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpSaving, setTotpSaving] = useState(false);
  const [totpMessage, setTotpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/security/status');
      if (res.ok) setStatus(await res.json());
    } catch (err) { console.error('Failed to fetch security status:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 12) { setPasswordMessage({ type: 'error', text: 'Password must be at least 12 characters' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMessage({ type: 'error', text: 'Passwords do not match' }); return; }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/admin/security/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: status?.passwordSet ? currentPassword : undefined, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        fetchStatus();
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch { setPasswordMessage({ type: 'error', text: 'An error occurred' }); }
    setPasswordSaving(false);
  };

  const handleTotpSetup = async () => {
    setTotpMessage(null);
    try {
      const res = await fetch('/api/admin/security/totp/setup', { method: 'POST' });
      const data = await res.json();
      if (data.secret) setTotpSetup(data);
      else setTotpMessage({ type: 'error', text: data.error || 'Failed to setup 2FA' });
    } catch { setTotpMessage({ type: 'error', text: 'An error occurred' }); }
  };

  const handleTotpVerify = async () => {
    if (!totpSetup || totpCode.length !== 6) return;
    setTotpSaving(true);
    setTotpMessage(null);
    try {
      const res = await fetch('/api/admin/security/totp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode, secret: totpSetup.secret }),
      });
      const data = await res.json();
      if (data.success) {
        setTotpMessage({ type: 'success', text: '2FA enabled successfully!' });
        setTotpSetup(null); setTotpCode('');
        fetchStatus();
      } else {
        setTotpMessage({ type: 'error', text: data.error || 'Invalid code' });
      }
    } catch { setTotpMessage({ type: 'error', text: 'An error occurred' }); }
    setTotpSaving(false);
  };

  const handleTotpDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;
    try {
      const res = await fetch('/api/admin/security/totp/disable', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTotpMessage({ type: 'success', text: '2FA has been disabled' });
        fetchStatus();
      }
    } catch { setTotpMessage({ type: 'error', text: 'Failed to disable 2FA' }); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 text-gray-400 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-[#2E2865]" />
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#2E2865]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Password</h2>
              <p className="text-sm text-gray-500">Your password is {status?.passwordSet ? 'set' : 'not set'}. Change it regularly for security.</p>
            </div>
            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${status?.passwordSet ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {status?.passwordSet ? 'Set' : 'Not Set'}
            </span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {status?.passwordSet && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="Minimum 12 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
            </div>
            {passwordMessage && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {passwordMessage.text}
              </div>
            )}
            <button type="submit" disabled={passwordSaving}
              className="px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-2">
              {passwordSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
              Change Password
            </button>
          </form>
        </div>

        {/* 2FA */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500">Add an extra layer of security using an authenticator app.</p>
            </div>
            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${status?.totpEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {status?.totpEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {totpMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${totpMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {totpMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {totpMessage.text}
            </div>
          )}

          {status?.totpEnabled ? (
            <button onClick={handleTotpDisable} className="px-4 py-2 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50">
              Disable 2FA
            </button>
          ) : totpSetup ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
              <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200 w-fit mx-auto">
                <QRCodeSVG value={totpSetup.uri} size={200} />
              </div>
              <details className="text-sm">
                <summary className="text-gray-500 cursor-pointer hover:text-gray-700">Can&apos;t scan? Enter manually</summary>
                <code className="mt-2 block bg-gray-50 p-3 rounded-lg text-xs font-mono break-all">{totpSetup.secret}</code>
              </details>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter the 6-digit code to verify</label>
                <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="000000" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleTotpVerify} disabled={totpSaving || totpCode.length !== 6}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  {totpSaving && <RefreshCw className="h-4 w-4 animate-spin" />} Enable 2FA
                </button>
                <button onClick={() => { setTotpSetup(null); setTotpCode(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleTotpSetup} className="px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50]">
              Enable 2FA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
