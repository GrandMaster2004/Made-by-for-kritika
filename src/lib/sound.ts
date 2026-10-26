/**
 * All audio is synthesised live with the Web Audio API: an original,
 * gentle music-box lullaby plus tiny interaction sounds. No audio files,
 * no external links, no copyrighted music — and if Web Audio is missing,
 * everything quietly does nothing.
 */

export type SfxName = 'start' | 'yes' | 'no' | 'hug';

type AudioCtor = typeof AudioContext;

function getAudioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

const mtof = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

interface Chord {
  /** root, third, fifth, octave (MIDI note numbers) */
  readonly tones: readonly [number, number, number, number];
  readonly bass: number;
}

/** I – vi – IV – V in F major. */
const PROGRESSION: readonly Chord[] = [
  { tones: [65, 69, 72, 77], bass: 41 },
  { tones: [62, 65, 69, 74], bass: 38 },
  { tones: [58, 62, 65, 70], bass: 46 },
  { tones: [60, 64, 67, 72], bass: 48 },
];
const ARPEGGIO = [0, 2, 1, 2, 3, 2, 1, 2] as const;
const STEPS_PER_BAR = ARPEGGIO.length;
const EIGHTH = 60 / 72 / 2; // 72 BPM
const LOOKAHEAD = 0.25;
const MUSIC_LEVEL = 0.5;

function settle(p: Promise<unknown> | undefined): void {
  p?.catch(() => undefined);
}

export class LoveTunes {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private playing = false;

  get supported(): boolean {
    return getAudioCtor() !== null;
  }

  /** Creates the audio graph lazily — only ever from a user gesture. */
  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = getAudioCtor();
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      const musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);

      // A soft echo makes the music box feel dreamy.
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.36;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.28;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 2400;
      const wet = ctx.createGain();
      wet.gain.value = 0.3;
      musicBus.connect(delay);
      delay.connect(tone);
      tone.connect(feedback);
      feedback.connect(delay);
      tone.connect(wet);
      wet.connect(master);

      const sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.55;
      sfxBus.connect(master);

      this.ctx = ctx;
      this.musicBus = musicBus;
      this.sfxBus = sfxBus;
      return ctx;
    } catch {
      return null;
    }
  }

  /** Starts the lullaby. Returns false when audio is unavailable. */
  start(): boolean {
    const ctx = this.ensure();
    if (!ctx || !this.musicBus) return false;
    if (ctx.state !== 'running') settle(ctx.resume());
    if (this.playing) return true;

    this.playing = true;
    const now = ctx.currentTime;
    const gain = this.musicBus.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(MUSIC_LEVEL, now + 1.8);

    this.nextTime = now + 0.1;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
    return true;
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    const now = ctx.currentTime;
    const gain = this.musicBus.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + 0.35);
  }

  suspend(): void {
    settle(this.ctx?.suspend());
  }

  resume(): void {
    settle(this.ctx?.resume());
  }

  dispose(): void {
    this.stop();
    const ctx = this.ctx;
    this.ctx = null;
    this.musicBus = null;
    this.sfxBus = null;
    settle(ctx?.close());
  }

  sfx(name: SfxName): void {
    const ctx = this.ensure();
    const bus = this.sfxBus;
    if (!ctx || !bus) return;
    if (ctx.state === 'suspended') settle(ctx.resume());
    const t = ctx.currentTime + 0.01;

    switch (name) {
      case 'start':
        [84, 88, 91].forEach((m, i) => this.bell(bus, m, t + i * 0.06, 0.12, 0.9));
        break;
      case 'yes':
        [79, 84, 88, 91].forEach((m, i) => this.bell(bus, m, t + i * 0.07, 0.14, 1.1));
        break;
      case 'no':
        this.sweep(bus, 520, 320, t, 0.16, 0.12);
        break;
      case 'hug':
        [65, 69, 72, 77].forEach((m, i) => this.bell(bus, m, t + i * 0.09, 0.1, 1.8));
        break;
    }
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || !this.playing) return;
    // If the tab was throttled, skip ahead instead of firing a burst of late notes.
    if (this.nextTime < ctx.currentTime - 0.05) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += EIGHTH;
      this.step = (this.step + 1) % (PROGRESSION.length * STEPS_PER_BAR);
    }
  }

  private playStep(step: number, t: number): void {
    const bus = this.musicBus;
    const chord = PROGRESSION[Math.floor(step / STEPS_PER_BAR)];
    if (!bus || !chord) return;
    const i = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR);

    if (i === 0) this.pad(bus, chord.bass, t, EIGHTH * STEPS_PER_BAR);
    const toneIndex = ARPEGGIO[i] ?? 0;
    this.bell(bus, chord.tones[toneIndex], t, i === 0 ? 0.14 : 0.09, 1.5);
    if (i === 7 && bar % 2 === 1) {
      this.bell(bus, chord.tones[3] + 12, t + EIGHTH / 2, 0.035, 1.2);
    }
  }

  private bell(dest: AudioNode, midi: number, t: number, peak: number, length: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const f = mtof(midi);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    env.connect(dest);

    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(f, t);
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(f * 2.005, t);
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.22;

    body.connect(env);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(env);
    body.start(t);
    shimmer.start(t);
    body.stop(t + length + 0.05);
    shimmer.stop(t + length + 0.05);
    body.onended = () => {
      env.disconnect();
      shimmerGain.disconnect();
    };
  }

  private pad(dest: AudioNode, midi: number, t: number, dur: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.06, t + 0.5);
    env.gain.setValueAtTime(0.06, t + dur - 0.4);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
    env.connect(dest);

    const partials: ReadonlyArray<readonly [number, number]> = [
      [mtof(midi), 1],
      [mtof(midi + 12) * 1.002, 0.5],
      [mtof(midi + 19), 0.18],
    ];
    partials.forEach(([freq, level]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g);
      g.connect(env);
      osc.start(t);
      osc.stop(t + dur + 0.35);
      osc.onended = () => g.disconnect();
    });
  }

  private sweep(dest: AudioNode, from: number, to: number, t: number, dur: number, peak: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    osc.onended = () => g.disconnect();
  }
}
