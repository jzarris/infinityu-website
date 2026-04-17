'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface TilePuzzleProps {
  imageSrc: string;
  cols?: number;
  rows?: number;
  className?: string;
  /** Auto-animate from the initial scrambled state to the solved image on mount. */
  autoSolve?: boolean;
  /** Alt text for screen readers */
  alt?: string;
}

/**
 * Tiny deterministic PRNG so the initial scrambled state is identical on
 * server and client (no hydration mismatch, no flash of unscrambled tiles).
 */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Produce a scrambled arrangement by applying random legal moves to a solved
 * board. Also return the sequence of grid indexes to click — in order — to
 * solve it. Each solve step is a single adjacent swap, so the CSS transition
 * on each tile slides it smoothly into place.
 */
function buildScramble(
  total: number,
  cols: number,
  rows: number,
  moves: number,
  seed: number
): { scrambled: number[]; solveSequence: number[] } {
  const rng = createRng(seed);
  const arr = Array.from({ length: total }, (_, i) => i);
  const blankOriginal = total - 1;
  let blank = blankOriginal;
  let last = -1;
  const solveSequence: number[] = [];

  for (let i = 0; i < moves; i++) {
    const r = Math.floor(blank / cols);
    const c = blank % cols;
    const cands: number[] = [];
    if (r > 0) cands.push(blank - cols);
    if (r < rows - 1) cands.push(blank + cols);
    if (c > 0) cands.push(blank - 1);
    if (c < cols - 1) cands.push(blank + 1);
    const filtered = cands.filter((x) => x !== last);
    const pick = filtered[Math.floor(rng() * filtered.length)];

    // Record the index the blank is about to leave. When we reverse the
    // scramble, we need to click THAT cell (the tile now sitting there has to
    // travel back to `pick`, which will be the blank at that moment).
    solveSequence.push(blank);

    [arr[blank], arr[pick]] = [arr[pick], arr[blank]];
    last = blank;
    blank = pick;
  }

  solveSequence.reverse();
  return { scrambled: arr, solveSequence };
}

/**
 * Search seeds for a scramble that satisfies visual constraints:
 *  - Complete derangement: no non-blank tile sits in its home cell.
 *  - Image-center tiles (center column, middle rows) land in the bottom row.
 *
 * Relaxes the center-in-bottom constraint first, then the derangement
 * constraint, if the strict version isn't found within the seed budget.
 */
function buildFramedScramble(
  total: number,
  cols: number,
  rows: number,
  moves: number
): { scrambled: number[]; solveSequence: number[] } {
  const blankOriginal = total - 1;
  const bottomRowStart = (rows - 1) * cols;
  const centerCol = Math.floor(cols / 2);
  const centerTiles: number[] = [];
  for (let r = 1; r < rows - 1; r++) {
    centerTiles.push(r * cols + centerCol);
  }

  const isDerangement = (s: number[]) => {
    for (let i = 0; i < total; i++) {
      if (i === blankOriginal) continue;
      if (s[i] === i) return false;
    }
    return true;
  };
  const centersAtBottom = (s: number[]) =>
    centerTiles.every((id) => s.indexOf(id) >= bottomRowStart);

  let derangementOnly: ReturnType<typeof buildScramble> | null = null;
  let firstResult: ReturnType<typeof buildScramble> | null = null;

  for (let seed = 1; seed <= 4000; seed++) {
    const result = buildScramble(total, cols, rows, moves, seed);
    if (!firstResult) firstResult = result;
    const deranged = isDerangement(result.scrambled);
    if (deranged && centersAtBottom(result.scrambled)) return result;
    if (deranged && !derangementOnly) derangementOnly = result;
  }
  return derangementOnly ?? firstResult!;
}

export function TilePuzzle({
  imageSrc,
  cols = 3,
  rows = 4,
  className = '',
  autoSolve = true,
  alt = 'Sliding tile puzzle',
}: TilePuzzleProps) {
  const total = cols * rows;
  const blankOriginal = total - 1;

  // Deterministic — same on server + client, safe for SSR.
  // Uses seed-search to guarantee a full derangement (no tile starts in its
  // home cell) with the image-center tiles pushed down to the bottom row.
  const initial = useMemo(
    () => buildFramedScramble(total, cols, rows, 36),
    [total, cols, rows]
  );

  // arrangement[gridIdx] = originalIdx currently occupying that cell.
  const [arrangement, setArrangement] = useState<number[]>(initial.scrambled);

  const move = useCallback(
    (gridIdx: number) => {
      setArrangement((prev) => {
        const blank = prev.indexOf(blankOriginal);
        const r1 = Math.floor(gridIdx / cols);
        const c1 = gridIdx % cols;
        const r2 = Math.floor(blank / cols);
        const c2 = blank % cols;
        const isAdj = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
        if (!isAdj) return prev;
        const next = [...prev];
        [next[blank], next[gridIdx]] = [next[gridIdx], next[blank]];
        return next;
      });
    },
    [blankOriginal, cols]
  );

  // Play the solve sequence on mount — one adjacent swap per tick so each
  // tile slides smoothly via its CSS transition.
  useEffect(() => {
    if (!autoSolve) return;
    let cancelled = false;
    const sequence = initial.solveSequence;
    let i = 0;
    const start = window.setTimeout(() => {
      const tick = () => {
        if (cancelled || i >= sequence.length) return;
        const gridIdx = sequence[i++];
        setArrangement((prev) => {
          const blank = prev.indexOf(blankOriginal);
          const next = [...prev];
          [next[blank], next[gridIdx]] = [next[gridIdx], next[blank]];
          return next;
        });
        if (i < sequence.length) {
          window.setTimeout(tick, 480);
        }
      };
      tick();
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [autoSolve, initial, blankOriginal]);

  // Denominators for background-position percentages (guard against cols/rows = 1).
  const colDen = Math.max(cols - 1, 1);
  const rowDen = Math.max(rows - 1, 1);

  // Look up current grid position of each original tile. Rendering in stable
  // originalIdx order — rather than by grid position — keeps React from
  // reordering DOM nodes, which would cancel in-flight CSS transitions.
  const positionOf = new Array<number>(total);
  for (let gridIdx = 0; gridIdx < total; gridIdx++) {
    positionOf[arrangement[gridIdx]] = gridIdx;
  }

  const wPct = 100 / cols;
  const hPct = 100 / rows;
  const transition =
    'top 460ms cubic-bezier(0.22, 1, 0.36, 1), left 460ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div className={className}>
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: `${cols} / ${rows}`,
          backgroundColor: 'var(--color-surface-alt)',
          boxShadow: 'var(--shadow-lg)',
        }}
        role="group"
        aria-label={alt}
      >
        {Array.from({ length: total }, (_, originalIdx) => {
          const gridIdx = positionOf[originalIdx];
          const gridR = Math.floor(gridIdx / cols);
          const gridC = gridIdx % cols;
          const topPct = gridR * (100 / rows);
          const leftPct = gridC * (100 / cols);

          if (originalIdx === blankOriginal) {
            return (
              <div
                key="blank"
                aria-hidden
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${wPct}%`,
                  height: `${hPct}%`,
                  transition,
                }}
              />
            );
          }

          const origR = Math.floor(originalIdx / cols);
          const origC = originalIdx % cols;

          return (
            <button
              key={originalIdx}
              type="button"
              onClick={() => move(gridIdx)}
              aria-label={`Tile ${originalIdx + 1}`}
              style={{
                position: 'absolute',
                top: `${topPct}%`,
                left: `${leftPct}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
                padding: 3,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                transition,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${(origC / colDen) * 100}% ${(origR / rowDen) * 100}%`,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
