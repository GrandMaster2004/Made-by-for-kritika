import { Teddy } from '../components/art';
import { WELCOME } from '../content';
import { cssVars } from '../lib/style';

export function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="screen welcome-screen">
      <div className="welcome-inner">
        <div className="welcome-teddy-wrap rise" style={cssVars({ '--d': '0ms' })}>
          <Teddy className="welcome-teddy" />
          <span className="teddy-float-heart fh1" aria-hidden="true">💗</span>
          <span className="teddy-float-heart fh2" aria-hidden="true">💕</span>
          <span className="teddy-float-heart fh3" aria-hidden="true">✨</span>
        </div>

        <p className="welcome-kicker rise" style={cssVars({ '--d': '120ms' })}>
          {WELCOME.kicker}
        </p>

        <h1 className="welcome-title rise" style={cssVars({ '--d': '220ms' })}>
          <span className="welcome-hey">{WELCOME.hey}</span>
          <span className="welcome-name-row">
            <span className="welcome-name">{WELCOME.name}</span>
            <span className="welcome-emoji" aria-hidden="true">
              🥹❤️
            </span>
          </span>
        </h1>

        <div className="welcome-card glass-card rise" style={cssVars({ '--d': '340ms' })}>
          {WELCOME.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="welcome-ready">{WELCOME.ready}</p>
        </div>

        <button type="button" className="btn-cta rise" style={cssVars({ '--d': '480ms' })} onClick={onBegin}>
          <span>{WELCOME.cta}</span>
        </button>

        <p className="welcome-signature rise" style={cssVars({ '--d': '600ms' })}>
          — {WELCOME.signature}
        </p>
      </div>
    </section>
  );
}
