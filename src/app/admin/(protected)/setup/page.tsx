'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Eye, EyeOff, Save, Trash2, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface SettingStatus {
  configured: boolean;
  source: 'admin' | 'env' | null;
  maskedValue: string | null;
  value?: string;
}

interface ApiKeyCardProps {
  title: string;
  description: string;
  settingKey: string;
  status: SettingStatus | null;
  testIntegration?: string;
  helpUrl?: string;
  helpText?: string;
  isEmail?: boolean;
  onSave: (key: string, value: string) => Promise<void>;
  onRemove: (key: string) => Promise<void>;
  onTest?: (integration: string) => Promise<void>;
}

function ApiKeyCard({ title, description, settingKey, status, testIntegration, helpUrl, helpText, isEmail, onSave, onRemove, onTest }: ApiKeyCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    await onSave(settingKey, value);
    setSaving(false);
    setEditing(false);
    setValue('');
  };

  const handleRemove = async () => {
    if (!confirm('Remove this setting? The system will fall back to environment variable if set.')) return;
    await onRemove(settingKey);
  };

  const handleTest = async () => {
    if (!testIntegration || !onTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      await onTest(testIntegration);
      setTestResult({ success: true, message: 'Integration test passed' });
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Test failed' });
    }
    setTesting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.configured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {status?.configured ? (status.source === 'env' ? 'From ENV' : 'Configured') : 'Not configured'}
        </span>
      </div>

      {status?.maskedValue && !editing && (
        <div className="flex items-center gap-2 mb-4">
          <code className="text-sm bg-gray-50 px-3 py-1.5 rounded border border-gray-200 font-mono">
            {showValue ? status.maskedValue : '••••••••••••'}
          </code>
          <button onClick={() => setShowValue(!showValue)} className="text-gray-400 hover:text-gray-600">
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <input type={isEmail ? 'email' : 'text'} value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
            placeholder={isEmail ? 'email@example.com' : 'Enter API key...'} />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !value} className="px-3 py-1.5 bg-[#2E2865] text-white text-sm rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-1">
              {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </button>
            <button onClick={() => { setEditing(false); setValue(''); }} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(true)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
            {status?.configured ? 'Update' : 'Configure'}
          </button>
          {status?.configured && status.source === 'admin' && (
            <button onClick={handleRemove} className="px-3 py-1.5 text-red-600 text-sm rounded-lg hover:bg-red-50 flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          )}
          {testIntegration && onTest && status?.configured && (
            <button onClick={handleTest} disabled={testing} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
              {testing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Test Integration
            </button>
          )}
        </div>
      )}

      {testResult && (
        <div className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {testResult.success ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
          {testResult.message}
        </div>
      )}

      {helpUrl && (
        <p className="mt-3 text-xs text-gray-400">
          {helpText || 'Get your API key.'}{' '}
          <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-[#2E2865] hover:underline inline-flex items-center gap-0.5">
            Get API key <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      )}
    </div>
  );
}

function InstagramUrlsCard({ urls, onSave }: { urls: string; onSave: (value: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [urlList, setUrlList] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (urls) setUrlList(urls.split(',').map(u => u.trim()).filter(Boolean));
  }, [urls]);

  const addUrl = () => {
    if (!newUrl.trim() || urlList.length >= 4) return;
    setUrlList([...urlList, newUrl.trim()]);
    setNewUrl('');
  };

  const removeUrl = (index: number) => setUrlList(urlList.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    await onSave(urlList.join(','));
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Instagram Post URLs</h3>
          <p className="text-sm text-gray-500">Enter Instagram post URLs to embed on the homepage (up to 4 posts).</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${urlList.length > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {urlList.length > 0 ? `${urlList.length} posts` : 'Not configured'}
        </span>
      </div>

      {urlList.length > 0 && !editing && (
        <ol className="space-y-2 mb-4">
          {urlList.map((url, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#2E2865] hover:underline truncate">{url}</a>
            </li>
          ))}
        </ol>
      )}

      {editing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {urlList.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                <input value={url} readOnly className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50" />
                <button onClick={() => removeUrl(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {urlList.length < 4 && (
            <div className="flex gap-2">
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
              <button onClick={addUrl} disabled={!newUrl.trim()} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-[#2E2865] text-white text-sm rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-1">
              {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </button>
            <button onClick={() => { setEditing(false); if (urls) setUrlList(urls.split(',').map(u => u.trim()).filter(Boolean)); }}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
          <p className="text-xs text-gray-400">To get a post URL, go to the post on Instagram, click the three dots (...), and select &quot;Copy Link&quot;.</p>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
          Edit
        </button>
      )}
    </div>
  );
}

interface BrandingData {
  logo: string | null;
  favicon: string | null;
}

function BrandingSection() {
  const [branding, setBranding] = useState<BrandingData>({ logo: null, favicon: null });
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/branding');
      if (res.ok) setBranding(await res.json());
    } catch (err) { console.error('Failed to fetch branding:', err); }
  }, []);

  useEffect(() => { fetchBranding(); }, [fetchBranding]);

  const handleUpload = async (type: 'logo' | 'favicon', file: File) => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch('/api/admin/branding', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
      await fetchBranding();
    } catch { alert('Upload failed'); }
    setUploading(null);
  };

  const handleRemove = async (type: 'logo' | 'favicon') => {
    if (!confirm(`Remove the ${type}?`)) return;
    setUploading(type);
    try {
      await fetch('/api/admin/branding', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
      await fetchBranding();
    } catch { alert('Failed to remove'); }
    setUploading(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Logo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Logo</h3>
          {branding.logo && (
            <button onClick={() => handleRemove('logo')} className="text-red-400 hover:text-red-600" title="Remove logo">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center bg-gray-50 min-h-[120px]">
          {branding.logo ? (
            <Image src={branding.logo} alt="Logo" width={300} height={100} className="max-h-[100px] w-auto object-contain" unoptimized />
          ) : (
            <div className="text-gray-300 flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10" />
              <span className="text-xs">No logo uploaded</span>
            </div>
          )}
        </div>
        <label className="block">
          <span className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#2E2865] text-white font-medium rounded-lg hover:bg-[#231f50] cursor-pointer transition-colors">
            {uploading === 'logo' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Logo
          </span>
          <input type="file" className="hidden" accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('logo', f); e.target.value = ''; }} />
        </label>
        <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG, or WebP. Max 5MB.</p>
      </div>

      {/* Favicon */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Favicon</h3>
          {branding.favicon && (
            <button onClick={() => handleRemove('favicon')} className="text-red-400 hover:text-red-600" title="Remove favicon">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center bg-gray-50 min-h-[120px]">
          {branding.favicon ? (
            <Image src={branding.favicon} alt="Favicon" width={64} height={64} className="h-16 w-16 object-contain" unoptimized />
          ) : (
            <div className="text-gray-300 flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10" />
              <span className="text-xs">No favicon uploaded</span>
            </div>
          )}
        </div>
        <label className="block">
          <span className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#2E2865] text-white font-medium rounded-lg hover:bg-[#231f50] cursor-pointer transition-colors">
            {uploading === 'favicon' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Favicon
          </span>
          <input type="file" className="hidden" accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('favicon', f); e.target.value = ''; }} />
        </label>
        <p className="text-xs text-gray-400 mt-2">PNG, ICO, or SVG. Max 1MB.</p>
      </div>
    </div>
  );
}

export default function AdminSetupPage() {
  const [settings, setSettings] = useState<Record<string, SettingStatus | null>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) { console.error('Failed to fetch settings:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (key: string, value: string) => {
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    await fetchSettings();
  };

  const handleRemove = async (key: string) => {
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: null }) });
    await fetchSettings();
  };

  const handleTest = async (integration: string) => {
    const res = await fetch('/api/admin/test-integration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ integration, email: 'jack@nyx0.dev' }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Test failed');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 text-gray-400 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-[#2E2865]" />
        <h1 className="text-2xl font-bold text-gray-900">Setup</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Branding</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a custom logo and favicon for your site. The logo will appear in the header next to your site name.</p>
          <BrandingSection />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔑 API Keys</h2>
          <div className="space-y-4">
            <ApiKeyCard title="Claude AI (Anthropic)" description="Powers AI features like chat assistance and content generation."
              settingKey="anthropic_api_key" status={settings.anthropic as SettingStatus} testIntegration="anthropic"
              helpUrl="https://console.anthropic.com/account/keys" helpText="Get your API key from the Anthropic Console."
              onSave={handleSave} onRemove={handleRemove} onTest={handleTest} />
            <ApiKeyCard title="Resend (Email)" description="Send emails for contact form notifications."
              settingKey="resend_api_key" status={settings.resend as SettingStatus} testIntegration="resend"
              helpUrl="https://resend.com/api-keys" helpText="Get your API key from Resend."
              onSave={handleSave} onRemove={handleRemove} onTest={handleTest} />
            <ApiKeyCard title="Instagram" description="Display your Instagram feed on the homepage."
              settingKey="instagram_access_token" status={settings.instagram as SettingStatus} testIntegration="instagram"
              helpUrl="https://developers.facebook.com/" helpText="Requires Facebook Developer account and Instagram Basic Display API setup."
              onSave={handleSave} onRemove={handleRemove} onTest={handleTest} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Instagram Post URLs</h2>
          <InstagramUrlsCard urls={(settings.instagram_post_urls as SettingStatus)?.value || ''} onSave={(value) => handleSave('instagram_post_urls', value)} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✉️ Email Notifications</h2>
          <ApiKeyCard title="Contact Form Email" description="Email address to receive notifications when someone submits the contact form."
            settingKey="contact_notification_email" status={settings.contact_notification_email as SettingStatus} isEmail
            onSave={handleSave} onRemove={handleRemove} />
        </section>
      </div>
    </div>
  );
}
