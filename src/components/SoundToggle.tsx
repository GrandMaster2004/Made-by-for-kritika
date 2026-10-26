import { useSound } from '../sound/SoundProvider';
import { MusicOffIcon, MusicOnIcon } from './art';

interface SoundToggleProps {
  /** Show the little "music?" bubble (welcome screen only). */
  hint: boolean;
}

/** Always-visible mute / unmute control. Sound is off until she taps it. */
export function SoundToggle({ hint }: SoundToggleProps) {
  const { enabled, supported, toggle } = useSound();
  if (!supported) return null;

  return (
    <div className="sound-toggle">
      {hint && !enabled && (
        <span className="sound-hint" aria-hidden="true">
          Soft music? 🎵
        </span>
      )}
      <button
        type="button"
        data-protect
        className={`sound-btn ${enabled ? 'is-on' : ''}`}
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? 'Mute the music' : 'Play soft music'}
        title={enabled ? 'Mute music' : 'Play soft music'}
      >
        {enabled ? <MusicOnIcon /> : <MusicOffIcon />}
      </button>
    </div>
  );
}
