'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'infinityu-announcement-grand-opening-v2';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (new Date() >= new Date('2026-09-27T00:00:00')) {
      setDismissed(true);
      return;
    }
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  if (dismissed) return null;

  return (
    <div className="bg-accent text-primary-dark text-sm py-2.5 px-4 relative">
      <div className="container-custom flex items-center justify-center">
        <p className="font-medium">
          🎉 Grand Opening — September 26, 2026 · 4–8 PM{' '}
          <a href="https://rsvp.infinity-u.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-semibold">
            RSVP now
          </a>
          {' · '}
          <a href="https://shop.infinity-u.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-semibold">
            🛍️ Grand Opening Deals
          </a>
        </p>
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
