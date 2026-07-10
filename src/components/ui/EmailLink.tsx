'use client';

import { useEffect, useState } from 'react';

interface EmailLinkProps {
  email: string;
  className?: string;
}

// Renders client-side only so Cloudflare doesn't see the email in server HTML
// and skips injecting its email-decode.min.js render-blocking script.
export function EmailLink({ email, className }: EmailLinkProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
