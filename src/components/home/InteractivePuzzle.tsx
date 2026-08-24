'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Rendered on the server → in initial HTML → becomes the LCP element.
// Uses same /images/tilepuzzle.jpg URL as the <link rel="preload"> in layout.tsx,
// so the image is already in the browser cache when these tiles try to paint.
function StaticPuzzleGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
        background: 'var(--color-surface-alt)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        if (i === 11) return <div key={i} style={{ aspectRatio: '1' }} />;
        return (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              backgroundImage: 'url(/images/tilepuzzle.jpg)',
              backgroundSize: '300% 400%',
              backgroundPosition: `${(col / 2) * 100}% ${(row / 3) * 100}%`,
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px rgba(58,27,48,0.15)',
            }}
          />
        );
      })}
    </div>
  );
}

// Code-split so TilePuzzle's JS is not in the main bundle.
const TilePuzzle = dynamic(
  () => import('@/components/TilePuzzle').then((m) => ({ default: m.TilePuzzle })),
  { ssr: false }
);

interface Props {
  imageSrc: string;
  cols: number;
  rows: number;
  alt: string;
}

// Server renders StaticPuzzleGrid (mounted=false during SSR) → goes into HTML → fast LCP.
// useEffect fires after the browser paints → mounted=true → TilePuzzle loads
// and animates. Animation is preserved; it just starts after initial paint.
export function InteractivePuzzle({ imageSrc, cols, rows, alt }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <StaticPuzzleGrid />;
  return <TilePuzzle imageSrc={imageSrc} cols={cols} rows={rows} alt={alt} />;
}
