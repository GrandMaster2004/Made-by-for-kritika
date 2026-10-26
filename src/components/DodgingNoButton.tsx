import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  collectObstacles,
  distancePointToRect,
  findSafePosition,
  getSafeArea,
  isRectSafe,
  type Point,
  type Rect,
  type Size,
} from '../lib/geometry';

interface DodgingNoButtonProps {
  children: ReactNode;
  className: string;
  /** While a YES reaction plays, the button rests (and the floating copy hides). */
  disabled?: boolean;
  reducedMotion: boolean;
  /** Called every time the button escapes. Never advances anything. */
  onDodge?: () => void;
}

/** How close (px) a mouse cursor may get before the button hops away. */
const APPROACH_PX = 56;
/** pointerdown, touchstart and click can all fire for one tap — count it once. */
const ATTEMPT_DEDUPE_MS = 140;

interface LiveState {
  floating: boolean;
  pos: Point;
  size: Size;
  from: Point | null;
  lastAttempt: number;
}

/**
 * The shy NO button. It starts in its normal place next to YES. The first
 * time she gets close (cursor) or touches it (finger), it lifts out into a
 * fixed-position copy (portalled to <body> so transformed ancestors can't
 * break `position: fixed`) and hops to a random safe spot: fully on screen,
 * clear of safe areas, and never over YES or any element marked
 * `data-protect`. It never triggers progression — its click handler only
 * dodges.
 */
export function DodgingNoButton({ children, className, disabled = false, reducedMotion, onDodge }: DodgingNoButtonProps) {
  const inlineRef = useRef<HTMLButtonElement>(null);
  const floatRef = useRef<HTMLButtonElement>(null);

  const [floating, setFloating] = useState(false);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [tilt, setTilt] = useState(0);
  const [hops, setHops] = useState(0);

  const live = useRef<LiveState>({
    floating: false,
    pos: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    from: null,
    lastAttempt: -Infinity,
  });
  const disabledRef = useRef(disabled);
  const onDodgeRef = useRef(onDodge);

  useLayoutEffect(() => {
    disabledRef.current = disabled;
    onDodgeRef.current = onDodge;
  }, [disabled, onDodge]);

  /** The rectangle the button logically occupies right now. */
  const logicalRect = useCallback((): Rect | null => {
    const s = live.current;
    if (s.floating) return { left: s.pos.x, top: s.pos.y, width: s.size.width, height: s.size.height };
    const el = inlineRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, []);

  const hop = useCallback(
    (pointer: Point | null): boolean => {
      const s = live.current;
      const rect = logicalRect();
      if (!rect) return false;
      if (!s.floating) s.size = { width: rect.width, height: rect.height };

      const next = findSafePosition({
        size: s.size,
        area: getSafeArea(),
        obstacles: collectObstacles(),
        avoid: pointer,
        current: { x: rect.left, y: rect.top },
      });
      if (!next) {
        // Nowhere safe (tiny screen): stay put and just shimmy.
        setTilt((t) => (t > 0 ? -9 : 9));
        return false;
      }

      // Animate from where it visually is right now (it may be mid-hop).
      const visual = s.floating ? floatRef.current?.getBoundingClientRect() : null;
      s.from = visual ? { x: visual.left, y: visual.top } : { x: rect.left, y: rect.top };
      s.pos = next;

      if (!s.floating) {
        s.floating = true;
        setSize(s.size);
        setFloating(true);
      }
      setPos(next);
      setTilt((t) => (t > 0 ? -6 : 6));
      setHops((h) => h + 1);
      return true;
    },
    [logicalRect],
  );

  const attempt = useCallback(
    (pointer: Point | null) => {
      if (disabledRef.current) return;
      const now = performance.now();
      if (now - live.current.lastAttempt < ATTEMPT_DEDUPE_MS) return;
      live.current.lastAttempt = now;
      hop(pointer);
      onDodgeRef.current?.();
    },
    [hop],
  );

  // Smooth, springy hop using the Web Animations API (instant with reduced motion).
  useLayoutEffect(() => {
    const el = floatRef.current;
    const from = live.current.from;
    live.current.from = null;
    if (!el || !from || hops === 0) return;
    if (reducedMotion || typeof el.animate !== 'function') return;
    el.getAnimations?.().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: `translate3d(${from.x}px, ${from.y}px, 0) rotate(0deg) scale(1)` },
        { transform: `translate3d(${(from.x + pos.x) / 2}px, ${(from.y + pos.y) / 2 - 18}px, 0) rotate(${tilt * 1.6}deg) scale(1.06)`, offset: 0.55 },
        { transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg) scale(1)` },
      ],
      { duration: 460, easing: 'cubic-bezier(.34,1.4,.64,1)' },
    );
  }, [hops, pos, tilt, reducedMotion]);

  // Keyboard users: keep focus on the visible copy once it floats.
  useEffect(() => {
    if (floating && document.activeElement === inlineRef.current) {
      floatRef.current?.focus({ preventScroll: true });
    }
  }, [floating]);

  // Desktop: dodge as soon as the cursor comes near.
  useEffect(() => {
    if (disabled) return;
    let raf = 0;
    let last: Point | null = null;
    const check = () => {
      raf = 0;
      const p = last;
      const rect = logicalRect();
      if (!p || !rect) return;
      if (distancePointToRect(p, rect) < APPROACH_PX) attempt(p);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [disabled, attempt, logicalRect]);

  // Phones: a non-passive touchstart lets us cancel the tap so no click is generated.
  useEffect(() => {
    const targets = [inlineRef.current, floatRef.current].filter((el): el is HTMLButtonElement => el !== null);
    const onTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const t = e.changedTouches[0];
      attempt(t ? { x: t.clientX, y: t.clientY } : null);
    };
    targets.forEach((el) => el.addEventListener('touchstart', onTouchStart, { passive: false }));
    return () => targets.forEach((el) => el.removeEventListener('touchstart', onTouchStart));
  }, [floating, disabled, attempt]);

  // Re-check the spot whenever the screen changes (rotation, address bar, resize, scroll).
  useEffect(() => {
    if (!floating) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      if (disabledRef.current) return;
      const s = live.current;
      const rect: Rect = { left: s.pos.x, top: s.pos.y, width: s.size.width, height: s.size.height };
      if (!isRectSafe(rect, getSafeArea(), collectObstacles())) hop(null);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const vv = window.visualViewport;
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    ro?.observe(document.body);
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.removeEventListener('scroll', schedule);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [floating, hop]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    attempt({ x: e.clientX, y: e.clientY });
  };

  // A click (or Enter / Space) on NO only ever dodges — it never answers.
  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    attempt(null);
  };

  return (
    <>
      <button
        ref={inlineRef}
        type="button"
        className={className}
        disabled={disabled}
        style={floating ? { visibility: 'hidden' } : undefined}
        tabIndex={floating ? -1 : undefined}
        aria-hidden={floating ? true : undefined}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {children}
      </button>

      {floating &&
        !disabled &&
        createPortal(
          <button
            ref={floatRef}
            type="button"
            className={`${className} no-floating`}
            data-testid="no-floating"
            data-hops={hops}
            style={{
              width: size.width,
              height: size.height,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`,
            }}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
          >
            {children}
          </button>,
          document.body,
        )}
    </>
  );
}
