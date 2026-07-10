'use client';
import dynamic from 'next/dynamic';

// Server-rendered placeholder that appears instantly as the LCP element.
// Same URL as <link rel="preload"> in layout.tsx, so image is already in cache.
// Dimensions match TilePuzzle (3:4 container, square tiles) to avoid CLS on swap.
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          />
        );
      })}
    </div>
  );
}

// TilePuzzle deferred until after initial paint so its JS doesn't block LCP.
// The loading fallback (StaticPuzzleGrid) is rendered on the server and in the
// initial HTML, becoming the LCP element. TilePuzzle loads async and takes over.
const TilePuzzle = dynamic(
  () => import('@/components/TilePuzzle').then((m) => ({ default: m.TilePuzzle })),
  { ssr: false, loading: () => <StaticPuzzleGrid /> }
);

interface Props {
  imageSrc: string;
  cols: number;
  rows: number;
  alt: string;
}

export function InteractivePuzzle({ imageSrc, cols, rows, alt }: Props) {
  return <TilePuzzle imageSrc={imageSrc} cols={cols} rows={rows} alt={alt} />;
}
