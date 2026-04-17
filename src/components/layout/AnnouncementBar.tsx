'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'infinityu-announcement-dismissed';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
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
          Welcome Dr. SiSii & Dr. Mike to InfinityU!{' '}
          <Link href="/doctors" className="underline hover:no-underline font-semibold">
            Meet our doctors
          </Link>
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
