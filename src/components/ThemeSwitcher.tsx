'use client';

import { useEffect, useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { THEMES, ThemeId, DEFAULT_THEME } from '@/lib/themes';
import { HEADLINES, HeadlineId, DEFAULT_HEADLINE } from '@/lib/headlines';
import { applyTheme } from './ThemeProvider';

const THEME_KEY = 'infinityu-theme';
const HEADLINE_KEY = 'infinityu-headline';

function applyHeadline(id: HeadlineId) {
  document.documentElement.setAttribute('data-headline', id);
  localStorage.setItem(HEADLINE_KEY, id);
  window.dispatchEvent(
    new CustomEvent<HeadlineId>('infinityu:headline', { detail: id })
  );
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [currentHeadline, setCurrentHeadline] = useState<HeadlineId>(DEFAULT_HEADLINE);

  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as ThemeId | null) ?? DEFAULT_THEME;
    setCurrentTheme(savedTheme);
    const savedHeadline =
      (localStorage.getItem(HEADLINE_KEY) as HeadlineId | null) ?? DEFAULT_HEADLINE;
    setCurrentHeadline(savedHeadline);
  }, []);

  function handleThemeSelect(id: ThemeId) {
    applyTheme(id);
    setCurrentTheme(id);
  }

  function handleHeadlineSelect(id: HeadlineId) {
    applyHeadline(id);
    setCurrentHeadline(id);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        aria-label="Open site preview settings"
        style={{ backgroundColor: 'rgb(17, 17, 17)' }}
      >
        {open ? <X className="h-5 w-5" /> : <Palette className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col"
          style={{
            backgroundColor: 'white',
            border: '1px solid rgb(229, 229, 229)',
            maxHeight: 'calc(100vh - 8rem)',
          }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: 'rgb(229, 229, 229)' }}
          >
            <h3
              className="font-semibold text-base"
              style={{ color: 'rgb(17, 17, 17)', fontFamily: 'system-ui, sans-serif' }}
            >
              Preview Settings
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'rgb(107, 107, 107)', fontFamily: 'system-ui, sans-serif' }}
            >
              Switch theme and hero headline — saved in your browser.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Theme section */}
            <div className="px-3 pt-3">
              <div
                className="px-2 pb-2 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'rgb(107, 107, 107)', fontFamily: 'system-ui, sans-serif' }}
              >
                Theme
              </div>
              {THEMES.map((theme) => {
                const active = theme.id === currentTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className="w-full text-left p-3 rounded-xl flex gap-3 items-start transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: active ? 'rgb(245, 245, 245)' : 'transparent',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    <div className="flex gap-1 shrink-0 pt-0.5">
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{
                          backgroundColor: theme.preview.primary,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{
                          backgroundColor: theme.preview.accent,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{
                          backgroundColor: theme.preview.background,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'rgb(17, 17, 17)' }}
                        >
                          {theme.name}
                        </span>
                        {active && (
                          <Check
                            className="h-4 w-4"
                            style={{ color: 'rgb(34, 197, 94)' }}
                          />
                        )}
                      </div>
                      <div
                        className="text-xs mt-0.5 italic"
                        style={{ color: 'rgb(107, 107, 107)' }}
                      >
                        {theme.tagline}
                      </div>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: 'rgb(107, 107, 107)' }}
                      >
                        {theme.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="mx-5 my-2 border-t"
              style={{ borderColor: 'rgb(229, 229, 229)' }}
            />

            {/* Headline section */}
            <div className="px-3 pb-3">
              <div
                className="px-2 pb-2 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'rgb(107, 107, 107)', fontFamily: 'system-ui, sans-serif' }}
              >
                Hero Headline
              </div>
              {HEADLINES.map((h) => {
                const active = h.id === currentHeadline;
                return (
                  <button
                    key={h.id}
                    onClick={() => handleHeadlineSelect(h.id)}
                    className="w-full text-left p-3 rounded-xl flex gap-3 items-start transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: active ? 'rgb(245, 245, 245)' : 'transparent',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'rgb(17, 17, 17)' }}
                        >
                          {h.label}
                        </span>
                        {active && (
                          <Check
                            className="h-4 w-4"
                            style={{ color: 'rgb(34, 197, 94)' }}
                          />
                        )}
                      </div>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: 'rgb(107, 107, 107)' }}
                      >
                        {h.lead} {h.accent}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
