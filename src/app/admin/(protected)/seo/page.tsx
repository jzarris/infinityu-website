'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Save, RefreshCw, Sparkles, ChevronDown, Globe, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface PageSeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
}

interface PageDef {
  slug: string;
  label: string;
  path: string;
}

interface SeoConfig {
  global: {
    siteTitle?: string;
    siteDescription?: string;
    keywords?: string[];
  };
  pages: Record<string, PageSeoSettings>;
  updated_at: string;
}

function GlobalSettings({ config, onSave }: { config: SeoConfig; onSave: (global: SeoConfig['global']) => Promise<void> }) {
  const [siteTitle, setSiteTitle] = useState(config.global.siteTitle || '');
  const [siteDescription, setSiteDescription] = useState(config.global.siteDescription || '');
  const [keywords, setKeywords] = useState(config.global.keywords?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      siteTitle: siteTitle || undefined,
      siteDescription: siteDescription || undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-[#2E2865]" />
        <h3 className="font-semibold text-gray-900">Global Site Settings</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">These settings apply site-wide and override the default metadata.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
          <input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
            placeholder="InfinityU Med Spa | Huntington Beach, CA" />
          <p className="text-xs text-gray-400 mt-1">{siteTitle.length}/60 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
          <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent resize-none"
            placeholder="Premier medical spa in Huntington Beach..." />
          <p className="text-xs text-gray-400 mt-1">{siteDescription.length}/160 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Global Keywords</label>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
            placeholder="med spa, Huntington Beach, Botox, HiFu..." />
          <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-2">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Global Settings
          </button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PageSeoCard({ page, settings, onSave }: {
  page: PageDef;
  settings: PageSeoSettings;
  onSave: (slug: string, settings: PageSeoSettings) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(settings.title || '');
  const [description, setDescription] = useState(settings.description || '');
  const [keywords, setKeywords] = useState(settings.keywords?.join(', ') || '');
  const [ogTitle, setOgTitle] = useState(settings.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(settings.ogDescription || '');
  const [noIndex, setNoIndex] = useState(settings.noIndex || false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(page.slug, {
        title: title || undefined,
        description: description || undefined,
        keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
        ogTitle: ogTitle || undefined,
        ogDescription: ogDescription || undefined,
        noIndex: noIndex || undefined,
      });
      setFeedback({ type: 'success', message: 'Saved' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save' });
    }
    setSaving(false);
  };

  const handleAI = async (action: 'generate' | 'improve') => {
    setAiLoading(true);
    setAiAction(action);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/seo/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          pageLabel: page.label,
          pagePath: page.path,
          currentTitle: title,
          currentDescription: description,
          currentKeywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');

      const s = data.suggestion;
      if (s.title) setTitle(s.title);
      if (s.description) setDescription(s.description);
      if (s.keywords) setKeywords(Array.isArray(s.keywords) ? s.keywords.join(', ') : s.keywords);
      if (s.ogTitle) setOgTitle(s.ogTitle);
      if (s.ogDescription) setOgDescription(s.ogDescription);

      setFeedback({
        type: 'success',
        message: s.reasoning
          ? `${s.reasoning}`
          : 'AI suggestion applied. Review and save to keep changes.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'AI generation failed' });
    }
    setAiLoading(false);
    setAiAction(null);
  };

  const hasContent = title || description || keywords || ogTitle || ogDescription;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div>
            <span className="font-medium text-gray-900">{page.label}</span>
            <span className="text-xs text-gray-400 ml-2">{page.path}</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => handleAI('generate')} disabled={aiLoading}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm">
              {aiLoading && aiAction === 'generate' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate with AI
            </button>
            {hasContent && (
              <button onClick={() => handleAI('improve')} disabled={aiLoading}
                className="px-3 py-1.5 border border-violet-300 text-violet-700 text-sm rounded-lg hover:bg-violet-50 disabled:opacity-50 flex items-center gap-1.5">
                {aiLoading && aiAction === 'improve' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Improve with AI
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
              placeholder="Page title for search results..." />
            <p className={`text-xs mt-1 ${title.length > 60 ? 'text-amber-600' : 'text-gray-400'}`}>{title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent resize-none"
              placeholder="Description shown in search results..." />
            <p className={`text-xs mt-1 ${description.length > 160 ? 'text-amber-600' : 'text-gray-400'}`}>{description.length}/160 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3..." />
          </div>

          <details className="group">
            <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
              <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
              Open Graph / Social
            </summary>
            <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
                  placeholder="Title for social media sharing (defaults to page title)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent resize-none"
                  placeholder="Description for social media sharing (defaults to meta description)" />
              </div>
            </div>
          </details>

          <div className="flex items-center gap-2">
            <input type="checkbox" id={`noindex-${page.slug}`} checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)}
              className="rounded border-gray-300 text-[#2E2865] focus:ring-[#2E2865]" />
            <label htmlFor={`noindex-${page.slug}`} className="text-sm text-gray-600">
              No Index — hide this page from search engines
            </label>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${feedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <a href={page.path} target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-[#2E2865] flex items-center gap-1">
              Preview page <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SeoPage() {
  const [config, setConfig] = useState<SeoConfig | null>(null);
  const [pages, setPages] = useState<PageDef[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setPages(data.pages);
      }
    } catch (err) { console.error('Failed to fetch SEO config:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSaveGlobal = async (global: SeoConfig['global']) => {
    await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ global }),
    });
    await fetchConfig();
  };

  const handleSavePage = async (slug: string, settings: PageSeoSettings) => {
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSlug: slug, settings }),
    });
    if (!res.ok) throw new Error('Save failed');
    await fetchConfig();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 text-gray-400 animate-spin" /></div>;
  if (!config) return <div className="text-center py-20 text-gray-500">Failed to load SEO settings.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Search className="h-6 w-6 text-[#2E2865]" />
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Manage search engine metadata for each page. Use AI to generate optimized titles, descriptions, and keywords.
      </p>

      <div className="space-y-8">
        <GlobalSettings config={config} onSave={handleSaveGlobal} />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Settings</h2>
          <div className="space-y-3">
            {pages.map((page) => (
              <PageSeoCard
                key={page.slug}
                page={page}
                settings={config.pages[page.slug] || {}}
                onSave={handleSavePage}
              />
            ))}
          </div>
        </section>

        {config.updated_at && (
          <p className="text-xs text-gray-400 text-right">
            Last updated: {new Date(config.updated_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
