'use client';

import { useEffect } from 'react';
import { DEFAULT_THEME, ThemeId, THEMES } from '@/lib/themes';

const STORAGE_KEY = 'infinityu-theme';

export function getThemeClass(id: ThemeId): string {
  return `theme-${id}`;
}

/**
 * Applies the persisted theme class to <html> on mount.
 * Runs before paint via useEffect; a tiny FOUC is acceptable for a preview tool.
 */
export function ThemeProvider() {
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? DEFAULT_THEME;
    applyTheme(saved);
  }, []);

  return null;
}

export function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  THEMES.forEach((t) => root.classList.remove(getThemeClass(t.id)));
  root.classList.add(getThemeClass(id));
  localStorage.setItem(STORAGE_KEY, id);
}

export function getCurrentTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  return (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? DEFAULT_THEME;
}
