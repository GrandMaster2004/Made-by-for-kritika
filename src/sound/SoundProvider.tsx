import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LoveTunes, type SfxName } from '../lib/sound';

export interface SoundApi {
  /** Music and sound effects are on. Always starts off — she opts in. */
  enabled: boolean;
  /** Web Audio is available on this device. */
  supported: boolean;
  toggle: () => void;
  play: (name: SfxName) => void;
}

const silent: SoundApi = {
  enabled: false,
  supported: false,
  toggle: () => undefined,
  play: () => undefined,
};

const SoundContext = createContext<SoundApi>(silent);

export function SoundProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<LoveTunes | null>(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [supported] = useState(() => new LoveTunes().supported);

  const getEngine = useCallback((): LoveTunes => {
    if (!engineRef.current) engineRef.current = new LoveTunes();
    return engineRef.current;
  }, []);

  const toggle = useCallback(() => {
    const engine = getEngine();
    if (enabledRef.current) {
      engine.stop();
      enabledRef.current = false;
      setEnabled(false);
    } else {
      const started = engine.start();
      enabledRef.current = started;
      setEnabled(started);
    }
  }, [getEngine]);

  const play = useCallback(
    (name: SfxName) => {
      if (enabledRef.current) getEngine().sfx(name);
    },
    [getEngine],
  );

  // Go quiet when the tab is hidden (phone locked, app switched).
  useEffect(() => {
    const onVisibility = () => {
      const engine = engineRef.current;
      if (!engine || !enabledRef.current) return;
      if (document.hidden) engine.suspend();
      else engine.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      enabledRef.current = false;
    },
    [],
  );

  const value = useMemo<SoundApi>(() => ({ enabled, supported, toggle, play }), [enabled, supported, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  return useContext(SoundContext);
}
