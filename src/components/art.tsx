import { useId } from 'react';
import { svgId } from '../lib/style';

/* Hand-drawn SVG illustrations — no image files, nothing to break. */

const TEDDY_HEART =
  'M100 192 C 82 180, 70 170, 70 158 C 70 149, 77 143, 85 143 C 91 143, 96 146, 100 152 C 104 146, 109 143, 115 143 C 123 143, 130 149, 130 158 C 130 170, 118 180, 100 192 Z';

interface TeddyProps {
  /** "heart": holding a heart. "hug": arms open wide, then a tight hug. */
  variant?: 'heart' | 'hug';
  className?: string;
}

export function Teddy({ variant = 'heart', className = '' }: TeddyProps) {
  const uid = useId();
  const fur = svgId(uid, 'fur');
  const belly = svgId(uid, 'belly');
  const heart = svgId(uid, 'heart');

  return (
    <svg
      viewBox="0 0 200 228"
      className={`teddy ${variant === 'hug' ? 'teddy--hug' : ''} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={fur} cx="40%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#e9bd90" />
          <stop offset="100%" stopColor="#b8784b" />
        </radialGradient>
        <radialGradient id={belly} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#fff0e0" />
          <stop offset="100%" stopColor="#f2c9a5" />
        </radialGradient>
        <linearGradient id={heart} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b93" />
          <stop offset="100%" stopColor="#c9184a" />
        </linearGradient>
      </defs>

      {/* ears */}
      <circle cx="54" cy="46" r="21" fill={`url(#${fur})`} />
      <circle cx="54" cy="46" r="11" fill="#f6c7a9" />
      <circle cx="146" cy="46" r="21" fill={`url(#${fur})`} />
      <circle cx="146" cy="46" r="11" fill="#f6c7a9" />

      {/* body & feet */}
      <ellipse cx="100" cy="172" rx="50" ry="45" fill={`url(#${fur})`} />
      <ellipse cx="100" cy="178" rx="30" ry="27" fill={`url(#${belly})`} />
      <ellipse cx="70" cy="212" rx="18" ry="12" fill={`url(#${fur})`} />
      <ellipse cx="130" cy="212" rx="18" ry="12" fill={`url(#${fur})`} />
      <ellipse cx="70" cy="213" rx="9" ry="6" fill="#f6c7a9" />
      <ellipse cx="130" cy="213" rx="9" ry="6" fill="#f6c7a9" />

      {/* head */}
      <circle cx="100" cy="84" r="53" fill={`url(#${fur})`} />
      <ellipse cx="100" cy="104" rx="26" ry="20" fill={`url(#${belly})`} />
      <ellipse cx="100" cy="96" rx="9" ry="6.5" fill="#4a2a22" />
      <path
        d="M100 102 v6 M100 108 q-7 7 -13 1 M100 108 q7 7 13 1"
        stroke="#4a2a22"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <g className="teddy-eye">
        <circle cx="79" cy="78" r="6.5" fill="#2d1a15" />
        <circle cx="81.5" cy="75.5" r="2" fill="#fff" />
      </g>
      <g className="teddy-eye">
        <circle cx="121" cy="78" r="6.5" fill="#2d1a15" />
        <circle cx="123.5" cy="75.5" r="2" fill="#fff" />
      </g>
      <ellipse cx="66" cy="100" rx="10" ry="6" fill="#ff8fab" opacity=".55" />
      <ellipse cx="134" cy="100" rx="10" ry="6" fill="#ff8fab" opacity=".55" />

      {/* the heart, then arms wrapped around it */}
      <path className="teddy-heart" d={TEDDY_HEART} fill={`url(#${heart})`} />
      <ellipse className="teddy-arm teddy-arm-l" cx="62" cy="163" rx="13" ry="25" fill={`url(#${fur})`} />
      <ellipse className="teddy-arm teddy-arm-r" cx="138" cy="163" rx="13" ry="25" fill={`url(#${fur})`} />
    </svg>
  );
}

export function SparkleShape({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 0 C 13 7, 17 11, 24 12 C 17 13, 13 17, 12 24 C 11 17, 7 13, 0 12 C 7 11, 11 7, 12 0 Z"
      />
    </svg>
  );
}

export function HeartGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 21.5C5.2 16.6 1 12.7 1 7.9 1 4.4 3.7 1.5 7.1 1.5c2 0 3.8 1 4.9 2.6 1.1-1.6 2.9-2.6 4.9-2.6 3.4 0 6.1 2.9 6.1 6.4 0 4.8-4.2 8.7-11 13.6Z"
      />
    </svg>
  );
}

export function MusicOnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d="M9 18V5l11-2v13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="18" r="3" fill="currentColor" />
      <circle cx="17" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export function MusicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d="M9 18V5l11-2v13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".55"
      />
      <circle cx="6" cy="18" r="3" fill="currentColor" opacity=".55" />
      <circle cx="17" cy="16" r="3" fill="currentColor" opacity=".55" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
