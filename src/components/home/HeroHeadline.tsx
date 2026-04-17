'use client';

import { useEffect, useState } from 'react';
import { HEADLINES, HeadlineId, DEFAULT_HEADLINE } from '@/lib/headlines';

export const HEADLINE_EVENT = 'infinityu:headline';

export function HeroHeadline() {
  const [id, setId] = useState<HeadlineId>(DEFAULT_HEADLINE);

  useEffect(() => {
    const current =
      (document.documentElement.dataset.headline as HeadlineId | undefined) ??
      DEFAULT_HEADLINE;
    setId(current);

    function onChange(e: Event) {
      const next = (e as CustomEvent<HeadlineId>).detail;
      if (next) setId(next);
    }
    window.addEventListener(HEADLINE_EVENT, onChange);
    return () => window.removeEventListener(HEADLINE_EVENT, onChange);
  }, []);

  const h = HEADLINES.find((x) => x.id === id) ?? HEADLINES[0];

  return (
    <>
      {h.lead}{' '}
      <span style={{ color: 'var(--color-accent)' }}>{h.accent}</span>
    </>
  );
}
