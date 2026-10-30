import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { HeartGlyph, Teddy } from '../components/art';
import { CELEBRATION, HUG, NAMES, PUNISHMENTS } from '../content';
import { cssVars } from '../lib/style';
import { useSound } from '../sound/SoundProvider';

interface CelebrationProps {
  /** How many times she tried NO — each one earned a punishment. */
  punishments: number;
  onRestart: () => void;
  reducedMotion: boolean;
}

const YAY = 'YAYYYYY,';

export function Celebration({ punishments, onRestart, reducedMotion }: CelebrationProps) {
  const [hugOpen, setHugOpen] = useState(false);
  const [hugCount, setHugCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(!reducedMotion);
  const { play } = useSound();

  useEffect(() => {
    if (!showConfetti) return;
    const id = window.setTimeout(() => setShowConfetti(false), 7500);
    return () => window.clearTimeout(id);
  }, [showConfetti]);

  const openHug = () => {
    setHugCount((c) => c + 1);
    setHugOpen(true);
    play('hug');
  };
  const closeHug = useCallback(() => setHugOpen(false), []);

  const hugMessage = HUG.messages[(Math.max(hugCount, 1) - 1) % HUG.messages.length];
  const bill = useMemo(() => buildBill(punishments), [punishments]);

  return (
    <section className="screen celebration-screen" aria-labelledby="celebration-title">
      {showConfetti && <Confetti />}

      <div className="celebration-inner">
        <div className="celebration-card glass-card rise" style={cssVars({ '--d': '0ms' })}>
          <h1 id="celebration-title" className="yay" aria-label={`YAYYYYY, ${NAMES.her.toUpperCase()}!`}>
            <span className="yay-word" aria-hidden="true">
              {YAY.split('').map((ch, i) => (
                <span key={i} className="wave" style={cssVars({ '--i': i })}>
                  {ch}
                </span>
              ))}
            </span>{' '}
            <span className="yay-name" aria-hidden="true">{NAMES.her.toUpperCase()}!</span>
          </h1>
          <p className="yay-emoji" aria-hidden="true">
            🥹❤️🌹
          </p>

          <p className="date-pill">{CELEBRATION.pill}</p>
          <p className="c-text">{CELEBRATION.chapter}</p>

          <ul className="plan-chips" aria-label="Our date plan">
            {CELEBRATION.plan.map((item, i) => (
              <li key={item.label} className="plan-chip rise" style={cssVars({ '--d': `${400 + i * 90}ms` })}>
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </li>
            ))}
          </ul>

          <div className="bill" data-testid="bill">
            {bill.length > 0 ? (
              <>
                <p className="bill-title">{CELEBRATION.billTitle}</p>
                <ul className="bill-list">
                  {bill.map((line) => (
                    <li key={line.key} className="bill-line">
                      <span aria-hidden="true">{line.icon}</span>
                      <span className="bill-qty">{line.amount}</span>
                      <span>{line.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="bill-note">{CELEBRATION.billNote}</p>
              </>
            ) : (
              <p className="bill-note">{CELEBRATION.billEmpty}</p>
            )}
          </div>

          <p className="c-text c-future">{CELEBRATION.future}</p>
          <p className="c-text">{CELEBRATION.closing}</p>
          <p className="c-signature">{CELEBRATION.signature}</p>
        </div>

        <h2 className="finale rise" style={cssVars({ '--d': '700ms' })} aria-label={`${NAMES.her} and ${NAMES.me} — ${CELEBRATION.finaleSub}`}>
          <span className="finale-names" aria-hidden="true">
            <span className="finale-name">{NAMES.her}</span>
            <HeartGlyph className="finale-heart" />
            <span className="finale-name">{NAMES.me}</span>
          </span>
          <span className="finale-sub" aria-hidden="true">
            — {CELEBRATION.finaleSub}
          </span>
        </h2>

        <button type="button" className="btn-hug rise" style={cssVars({ '--d': '850ms' })} onClick={openHug} data-testid="hug">
          {CELEBRATION.hugButton}
        </button>
        <button type="button" className="btn-link" onClick={onRestart}>
          {CELEBRATION.restart}
        </button>
      </div>

      {hugOpen && <HugOverlay message={hugMessage} onClose={closeHug} />}
    </section>
  );
}

interface BillLine {
  key: string;
  icon: string;
  amount: number;
  label: string;
}

/** Adds up every punishment she earned into one tidy bill. */
function buildBill(count: number): BillLine[] {
  const totals = new Map<number, number>();
  for (let k = 0; k < count; k++) {
    const i = k % PUNISHMENTS.length;
    totals.set(i, (totals.get(i) ?? 0) + (PUNISHMENTS[i]?.amount ?? 0));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([i, amount]) => {
      const p = PUNISHMENTS[i];
      if (!p) return [];
      return [{ key: `p${i}`, icon: p.icon, amount, label: amount === 1 ? p.unit[0] : p.unit[1] }];
    });
}

const CONFETTI_CHARS = ['❤️', '🌹', '✨', '💖', '💞', '🎉', '💕', '🌸'] as const;

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        key: i,
        char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
        style: cssVars({
          '--x': `${Math.random() * 100}%`,
          '--size': `${1 + Math.random() * 1.1}rem`,
          '--dur': `${3.8 + Math.random() * 2.6}s`,
          '--delay': `${Math.random() * 1400}ms`,
          '--drift': `${(Math.random() - 0.5) * 140}px`,
          '--rot': `${(Math.random() - 0.5) * 720}deg`,
        }),
      })),
    [],
  );

  return createPortal(
    <div className="confetti rm-hide" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.key} className="confetti-piece" style={p.style}>
          {p.char}
        </span>
      ))}
    </div>,
    document.body,
  );
}

function HugOverlay({ message, onClose }: { message: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="hug-overlay" role="dialog" aria-modal="true" aria-label={HUG.label} onClick={onClose}>
      <div
        className="hug-card glass-card"
        onClick={(e: ReactMouseEvent<HTMLDivElement>) => e.stopPropagation()}
        data-testid="hug-card"
      >
        <div className="hug-teddy-wrap">
          <Teddy variant="hug" className="hug-teddy" />
          <span className="hug-pop p1" aria-hidden="true">💗</span>
          <span className="hug-pop p2" aria-hidden="true">💕</span>
          <span className="hug-pop p3" aria-hidden="true">💖</span>
        </div>
        <p className="hug-title">{HUG.title}</p>
        <p className="hug-msg">{message}</p>
        <button ref={closeRef} type="button" className="btn-yes btn-small" onClick={onClose}>
          {HUG.thanks}
        </button>
      </div>
    </div>,
    document.body,
  );
}
