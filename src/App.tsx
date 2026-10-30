import { useCallback, useEffect, useRef, useState } from 'react';
import { Background } from './components/Background';
import { SoundToggle } from './components/SoundToggle';
import { QUESTIONS } from './content';
import { prefersReducedMotion, useReducedMotion } from './hooks/useReducedMotion';
import { Celebration } from './screens/Celebration';
import { Questions } from './screens/Questions';
import { Welcome } from './screens/Welcome';
import { useSound } from './sound/SoundProvider';

export type Stage = 'welcome' | 'questions' | 'celebration';

/** Length of the fade/slide out between stages (matches .stage-leave in CSS). */
const STAGE_EXIT_MS = 420;

const THEME_COLORS: Record<Stage, string> = {
  welcome: '#ffe3ec',
  questions: '#ffe3ec',
  celebration: '#ffdbe6',
};

export default function App() {
  const reducedMotion = useReducedMotion();
  const { play } = useSound();

  const [stage, setStage] = useState<Stage>('welcome');
  const [leaving, setLeaving] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [punishments, setPunishments] = useState(0);
  const switchTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (switchTimer.current !== null) window.clearTimeout(switchTimer.current);
    },
    [],
  );

  // Match the phone's browser bar to the scene.
  useEffect(() => {
    document.documentElement.dataset.stage = stage;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[stage]);
  }, [stage]);

  /** Smoothly swaps stages without reloading the page. */
  const goTo = useCallback((next: Stage, beforeSwap?: () => void) => {
    if (switchTimer.current !== null) return; // a transition is already running
    setLeaving(true);
    switchTimer.current = window.setTimeout(
      () => {
        switchTimer.current = null;
        beforeSwap?.();
        setStage(next);
        setLeaving(false);
        window.scrollTo(0, 0);
      },
      prefersReducedMotion() ? 40 : STAGE_EXIT_MS,
    );
  }, []);

  const begin = useCallback(() => {
    play('start');
    setQuestionIndex(0);
    setPunishments(0);
    goTo('questions');
  }, [goTo, play]);

  /** NO only ever adds a playful punishment; it never answers a question. */
  const punish = useCallback(() => setPunishments((n) => n + 1), []);

  /** Only a YES ever reaches here. NO has no path to this function. */
  const answeredYes = useCallback(() => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
      window.scrollTo(0, 0);
    } else {
      goTo('celebration');
    }
  }, [questionIndex, goTo]);

  const restart = useCallback(() => goTo('welcome', () => setQuestionIndex(0)), [goTo]);

  return (
    <>
      <Background scene={stage} />
      <SoundToggle hint={stage === 'welcome'} />

      <main key={stage} className={`stage ${leaving ? 'stage-leave' : 'stage-enter'}`} data-stage={stage}>
        {stage === 'welcome' && <Welcome onBegin={begin} />}
        {stage === 'questions' && (
          <Questions
            index={questionIndex}
            onAnswered={answeredYes}
            punishments={punishments}
            onPunish={punish}
            reducedMotion={reducedMotion}
          />
        )}
        {stage === 'celebration' && (
          <Celebration punishments={punishments} onRestart={restart} reducedMotion={reducedMotion} />
        )}
      </main>
    </>
  );
}
