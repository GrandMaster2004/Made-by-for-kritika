import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Point } from '../lib/geometry';
import { cssVars } from '../lib/style';

const DEFAULT_CHARS = ['❤️', '💖', '💗', '💞', '✨', '💕', '🌸'] as const;

interface BurstProps {
  origin: Point;
  count?: number;
  chars?: readonly string[];
}

/** A one-shot shower of hearts flying out from a point (e.g. the YES button). */
export function Burst({ origin, count = 14, chars = DEFAULT_CHARS }: BurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.45;
        const distance = 70 + Math.random() * 90;
        return {
          key: i,
          char: chars[i % chars.length],
          style: cssVars({
            '--dx': `${Math.cos(angle) * distance}px`,
            '--dy': `${Math.sin(angle) * distance - 40}px`,
            '--rot': `${(Math.random() - 0.5) * 80}deg`,
            '--size': `${1 + Math.random() * 0.9}rem`,
            '--delay': `${Math.random() * 90}ms`,
          }),
        };
      }),
    [count, chars],
  );

  return createPortal(
    <div className="burst rm-hide" style={{ left: origin.x, top: origin.y }} aria-hidden="true">
      {particles.map((p) => (
        <span key={p.key} className="burst-p" style={p.style}>
          {p.char}
        </span>
      ))}
    </div>,
    document.body,
  );
}
