'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'infinityu-announcement-dismissed-html';

export function AnnouncementBar() {
  const [html, setHtml] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/announcement')
      .then((r) => r.json())
      .then(({ enabled, html: content }: { enabled: boolean; html: string }) => {
        if (!enabled || !content) return;
        try {
          const dismissed = localStorage.getItem(STORAGE_KEY);
          if (dismissed === content) return;
        } catch { /* private window */ }
        setHtml(content);
      })
      .catch(() => {});
  }, []);

  function handleDismiss() {
    setDismissed(true);
    if (html) {
      try { localStorage.setItem(STORAGE_KEY, html); } catch { /* private window */ }
    }
  }

  if (!html || dismissed) return null;

  return (
    <div className="bg-accent text-primary-dark text-sm py-2.5 px-4 relative">
      <div className="container-custom flex items-center justify-center">
        <div
          className="font-medium text-center [&_a]:underline [&_a]:font-semibold [&_a:hover]:no-underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 hover:bg-accent-dark/20 rounded"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
