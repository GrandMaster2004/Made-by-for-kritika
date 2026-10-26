import type { CSSProperties } from 'react';

/** Lets components pass CSS custom properties (e.g. `--delay`) through `style`. */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as CSSProperties;
}

/** Tiny deterministic PRNG so decorations stay stable between renders. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** SVG ids must be plain characters; React's useId() output is not always. */
export function svgId(raw: string, suffix: string): string {
  return `${raw.replace(/[^a-zA-Z0-9_-]/g, '')}-${suffix}`;
}
