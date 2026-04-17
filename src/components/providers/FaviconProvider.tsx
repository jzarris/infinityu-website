'use client';

import { useEffect } from 'react';

export function FaviconProvider() {
  useEffect(() => {
    async function updateFavicon() {
      try {
        const res = await fetch('/api/branding');
        const data = await res.json();
        if (!data.favicon) return;

        // Update or create link[rel="icon"]
        let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
        if (!iconLink) {
          iconLink = document.createElement('link');
          iconLink.rel = 'icon';
          document.head.appendChild(iconLink);
        }
        iconLink.href = data.favicon;

        // Update or create link[rel="apple-touch-icon"]
        let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = data.favicon;
      } catch {
        // Keep defaults if branding unavailable
      }
    }
    updateFavicon();
  }, []);

  return null;
}
