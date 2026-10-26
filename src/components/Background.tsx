import { useMemo, useState, type CSSProperties } from 'react';
import { cssVars, seededRandom } from '../lib/style';
import { SparkleShape } from './art';

export type Scene = 'welcome' | 'questions' | 'celebration';

const SCENES: readonly Scene[] = ['welcome', 'questions', 'celebration'];

const FLOATERS: Record<Scene, readonly string[]> = {
  welcome: ['❤️', '💗', '🧸', '💖', '🌸', '💕', '✨'],
  questions: ['💗', '💞', '❤️', '🧸', '💌', '🌹', '🌸'],
  celebration: ['❤️', '🌹', '💞', '🧸', '💖', '🎉', '💕', '✨'],
};

const SPARKLE_COLORS: Record<Scene, readonly string[]> = {
  welcome: ['#ff9fbc', '#c8a6ff', '#ffd59e'],
  questions: ['#ff9fbc', '#c8a6ff', '#ffffff'],
  celebration: ['#ff7aa2', '#b98cff', '#ffcf70'],
};

interface Floater {
  key: string;
  char: string;
  outer: CSSProperties;
  inner: CSSProperties;
}

interface Sparkle {
  key: string;
  style: CSSProperties;
}

function buildFloaters(scene: Scene, count: number): Floater[] {
  const rand = seededRandom(scene.length * 7919 + count);
  const chars = FLOATERS[scene];
  return Array.from({ length: count }, (_, i) => {
    const duration = 15 + rand() * 12;
    return {
      key: `${scene}-f${i}`,
      char: chars[i % chars.length] ?? '❤️',
      outer: {
        left: `${((i + 0.1 + rand() * 0.8) / count) * 100}%`,
        fontSize: `${0.95 + rand() * 1.05}rem`,
        opacity: 0.35 + rand() * 0.45,
        animationDuration: `${duration}s`,
        animationDelay: `-${rand() * duration}s`,
      },
      inner: {
        animationDuration: `${3.4 + rand() * 3}s`,
        ...cssVars({ '--sway': `${10 + rand() * 22}px` }),
      },
    };
  });
}

function buildSparkles(scene: Scene, count: number): Sparkle[] {
  const rand = seededRandom(scene.length * 104729 + count);
  const colors = SPARKLE_COLORS[scene];
  return Array.from({ length: count }, (_, i) => ({
    key: `${scene}-s${i}`,
    style: {
      left: `${rand() * 96}%`,
      top: `${rand() * 94}%`,
      color: colors[i % colors.length],
      ...cssVars({
        '--s': `${8 + rand() * 12}px`,
        '--dur': `${2.4 + rand() * 2.4}s`,
        '--delay': `-${rand() * 4}s`,
      }),
    },
  }));
}

/**
 * Fixed, non-interactive decoration layer. It always sits behind the
 * content (z-index 0, pointer-events: none) so it can never block a tap.
 */
export function Background({ scene }: { scene: Scene }) {
  const [compact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  const floaters = useMemo(
    () => buildFloaters(scene, compact ? 12 : 20),
    [scene, compact],
  );
  const sparkles = useMemo(() => buildSparkles(scene, compact ? 10 : 18), [scene, compact]);

  return (
    <div className="scene" aria-hidden="true">
      {SCENES.map((s) => (
        <div key={s} className={`scene-layer scene-${s} ${s === scene ? 'is-active' : ''}`} />
      ))}
      <div className={`orb orb-a orb-${scene}`} />
      <div className={`orb orb-b orb-${scene}`} />
      <div className={`orb orb-c orb-${scene}`} />

      {sparkles.map((s) => (
        <span key={s.key} className="sparkle" style={s.style}>
          <SparkleShape className="sparkle-svg" />
        </span>
      ))}

      {floaters.map((f) => (
        <span key={f.key} className="floater rm-hide" style={f.outer}>
          <span className="floater-inner" style={f.inner}>
            {f.char}
          </span>
        </span>
      ))}

    </div>
  );
}
