/**
 * Pure-ish geometry helpers used by the runaway NO button.
 * Everything works in viewport (client) coordinates, which is what
 * `position: fixed` and `getBoundingClientRect()` both use.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function toRect(r: DOMRectReadOnly): Rect {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function expandRect(r: Rect, pad: number): Rect {
  return {
    left: r.left - pad,
    top: r.top - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/** Shortest distance from a point to a rectangle (0 when the point is inside). */
export function distancePointToRect(p: Point, r: Rect): number {
  const dx = Math.max(r.left - p.x, 0, p.x - (r.left + r.width));
  const dy = Math.max(r.top - p.y, 0, p.y - (r.top + r.height));
  return Math.hypot(dx, dy);
}

function rectInside(inner: Rect, outer: Rect, tolerance = 0.5): boolean {
  return (
    inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.left + inner.width <= outer.left + outer.width + tolerance &&
    inner.top + inner.height <= outer.top + outer.height + tolerance
  );
}

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

let insetProbe: HTMLDivElement | null = null;

/** Reads env(safe-area-inset-*) as pixels (notches, home indicators, rounded corners). */
function readSafeInsets(): Insets {
  if (!insetProbe || !insetProbe.isConnected) {
    insetProbe = document.createElement('div');
    insetProbe.setAttribute('aria-hidden', 'true');
    insetProbe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';
    document.body.appendChild(insetProbe);
  }
  const cs = getComputedStyle(insetProbe);
  const px = (value: string): number => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    top: px(cs.paddingTop),
    right: px(cs.paddingRight),
    bottom: px(cs.paddingBottom),
    left: px(cs.paddingLeft),
  };
}

/**
 * The part of the screen the button may move within: the visible
 * (visual) viewport, minus safe-area insets and a comfortable margin.
 */
export function getSafeArea(margin = 12): Rect {
  const vv = window.visualViewport;
  const vx = vv ? vv.offsetLeft : 0;
  const vy = vv ? vv.offsetTop : 0;
  const vw = vv ? Math.min(vv.width, document.documentElement.clientWidth || vv.width) : document.documentElement.clientWidth;
  const vh = vv ? vv.height : window.innerHeight;
  const inset = readSafeInsets();

  const left = vx + Math.max(margin, inset.left + 6);
  const top = vy + Math.max(margin, inset.top + 6);
  const right = vx + vw - Math.max(margin, inset.right + 6);
  const bottom = vy + vh - Math.max(margin, inset.bottom + 6);

  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/**
 * Everything marked with `data-protect` (question text, YES button,
 * progress, sound control…) is off-limits for the NO button.
 * `data-protect-pad="24"` gives an element a larger buffer.
 */
export function collectObstacles(defaultPad = 14): Rect[] {
  const out: Rect[] = [];
  document.querySelectorAll<HTMLElement>('[data-protect]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const pad = Number(el.dataset.protectPad ?? defaultPad);
    out.push(expandRect(toRect(r), Number.isFinite(pad) ? pad : defaultPad));
  });
  return out;
}

export function isRectSafe(rect: Rect, area: Rect, obstacles: readonly Rect[]): boolean {
  return rectInside(rect, area) && !obstacles.some((o) => rectsOverlap(rect, o));
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let v = from; v < to; v += step) out.push(v);
  out.push(to);
  return out;
}

/** Grid positions plus positions flush against each obstacle, so thin gaps aren't skipped. */
function candidateAxis(from: number, to: number, step: number, edges: number[]): number[] {
  const values = new Set(range(from, to, step));
  for (const e of edges) if (e >= from && e <= to) values.add(Math.round(e * 2) / 2);
  return [...values].sort((a, b) => a - b);
}

export interface SafeSpotOptions {
  size: Size;
  area: Rect;
  obstacles: readonly Rect[];
  /** Where the finger / cursor is, if known. The button runs away from it. */
  avoid: Point | null;
  /** The button's current top-left corner. */
  current: Point;
  random?: () => number;
}

interface Candidate {
  point: Point;
  jump: number;
  clearance: number;
}

/**
 * Picks a new top-left position for the button that is fully on screen,
 * touches no protected element, and is a satisfying hop away from the
 * pointer. Returns null only if the screen has no safe spot at all.
 */
export function findSafePosition({
  size,
  area,
  obstacles,
  avoid,
  current,
  random = Math.random,
}: SafeSpotOptions): Point | null {
  const maxX = area.left + area.width - size.width;
  const maxY = area.top + area.height - size.height;
  if (maxX < area.left || maxY < area.top) return null;

  const step = 12;
  const currentCenter = { x: current.x + size.width / 2, y: current.y + size.height / 2 };
  const valid: Candidate[] = [];

  const edge = 0.5; // half a pixel clear of the obstacle's padded edge
  const xs = candidateAxis(
    area.left,
    maxX,
    step,
    obstacles.flatMap((o) => [o.left + o.width + edge, o.left - size.width - edge]),
  );
  const ys = candidateAxis(
    area.top,
    maxY,
    step,
    obstacles.flatMap((o) => [o.top + o.height + edge, o.top - size.height - edge]),
  );

  for (const y of ys) {
    for (const x of xs) {
      const rect = { left: x, top: y, width: size.width, height: size.height };
      if (obstacles.some((o) => rectsOverlap(rect, o))) continue;
      const jump = Math.hypot(x + size.width / 2 - currentCenter.x, y + size.height / 2 - currentCenter.y);
      const clearance = avoid ? distancePointToRect(avoid, rect) : jump;
      valid.push({ point: { x, y }, jump, clearance });
    }
  }
  if (valid.length === 0) return null;

  // Best: a real hop that clears the finger/cursor comfortably.
  let pool = valid.filter((c) => c.jump >= 100 && c.clearance >= 110);
  // Small screens: accept a shorter hop.
  if (pool.length === 0) pool = valid.filter((c) => c.jump >= 36 && c.clearance >= 36);
  if (pool.length === 0) pool = valid;

  // Usually stay within teasing distance so she can see where it went.
  const nearby = pool.filter((c) => c.jump <= 300);
  const choices = nearby.length > 0 && random() < 0.75 ? nearby : pool;
  const pick = choices[Math.floor(random() * choices.length)] ?? choices[0];
  return pick.point;
}
