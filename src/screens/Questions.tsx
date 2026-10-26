import { useCallback, useEffect, useRef, useState } from 'react';
import { Burst } from '../components/Burst';
import { DodgingNoButton } from '../components/DodgingNoButton';
import { HeartGlyph } from '../components/art';
import { NO_TEASES, QUESTIONS, type Question } from '../content';
import type { Point } from '../lib/geometry';
import { cssVars } from '../lib/style';
import { useSound } from '../sound/SoundProvider';

interface QuestionsProps {
  /** 0-based index of the question being asked. */
  index: number;
  /** Called once, after the YES reaction for the current question has played. */
  onAnswered: () => void;
  reducedMotion: boolean;
}

export function Questions({ index, onAnswered, reducedMotion }: QuestionsProps) {
  const total = QUESTIONS.length;
  const question = QUESTIONS[index];
  if (!question) return null;

  return (
    <section className="screen questions-screen" aria-label={total === 1 ? 'The question' : `Question ${index + 1} of ${total}`}>
      <Progress current={index} total={total} />
      <QuestionCard
        key={question.id}
        question={question}
        isLast={index === total - 1}
        onAnswered={onAnswered}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="q-progress" data-protect role="status" aria-live="polite">
      <span className="q-progress-label">
        {total === 1 ? 'Bas ek sawaal 💌' : `Question ${current + 1} of ${total}`}
      </span>
      {total > 1 && (
        <span className="q-progress-hearts" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <HeartGlyph
              key={i}
              className={`q-progress-heart ${i < current ? 'is-done' : ''} ${i === current ? 'is-now' : ''}`}
            />
          ))}
        </span>
      )}
    </div>
  );
}

type Phase = 'asking' | 'celebrating' | 'leaving';

interface QuestionCardProps {
  question: Question;
  isLast: boolean;
  onAnswered: () => void;
  reducedMotion: boolean;
}

function QuestionCard({ question, isLast, onAnswered, reducedMotion }: QuestionCardProps) {
  const [phase, setPhase] = useState<Phase>('asking');
  const [teases, setTeases] = useState(0);
  const [burstAt, setBurstAt] = useState<Point | null>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const answeredRef = useRef(false);
  const timers = useRef<number[]>([]);
  const { play } = useSound();

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const handleYes = () => {
    if (answeredRef.current) return; // double taps can never skip a question
    answeredRef.current = true;
    play('yes');

    const r = yesRef.current?.getBoundingClientRect();
    if (r && !reducedMotion) setBurstAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setPhase('celebrating');

    const readingTime = isLast ? 2700 : 2300;
    timers.current.push(window.setTimeout(() => setPhase('leaving'), readingTime));
    timers.current.push(window.setTimeout(onAnswered, readingTime + (reducedMotion ? 60 : 380)));
  };

  const handleDodge = useCallback(() => {
    setTeases((t) => t + 1);
    play('no');
  }, [play]);

  const tease = teases > 0 ? NO_TEASES[(teases - 1 + question.id) % NO_TEASES.length] : '';
  const grow = 1 + Math.min(teases, 4) * 0.04;

  return (
    <>
      <article
        className={`q-card glass-card ${phase === 'leaving' ? 'card-out' : 'card-in'}`}
        aria-labelledby={`q-title-${question.id}`}
      >
        <div className="q-badge" aria-hidden="true">
          <span>{question.badge}</span>
        </div>

        <div className="q-text" data-protect>
          <p className="q-tag">{question.tag}</p>
          <h2 id={`q-title-${question.id}`} className="q-title">
            {question.text}
          </h2>
          <p className="q-note">{question.note}</p>
        </div>

        <div className="q-actions">
          <button
            ref={yesRef}
            type="button"
            className="btn-yes"
            data-protect
            data-protect-pad="22"
            data-testid="yes"
            style={cssVars({ '--grow': grow })}
            onClick={handleYes}
            disabled={phase !== 'asking'}
          >
            YES ❤️
          </button>
          <DodgingNoButton
            className="btn-no"
            disabled={phase !== 'asking'}
            reducedMotion={reducedMotion}
            onDodge={handleDodge}
          >
            NO 🙈
          </DodgingNoButton>
        </div>

        <p className="q-tease" data-protect aria-live="polite">
          {tease || ' '}
        </p>

        {phase !== 'asking' && (
          <div className="q-reaction" role="status" aria-live="assertive">
            <span className="q-reaction-emoji" aria-hidden="true">
              {question.reactionEmoji}
            </span>
            <p className="q-reaction-text">{question.reaction}</p>
            <p className="q-reaction-next">
              {isLast ? 'Ek chhota sa surprise aa raha hai' : 'Agla sawaal aa raha hai'}
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </p>
          </div>
        )}
      </article>
      {burstAt && <Burst origin={burstAt} />}
    </>
  );
}
