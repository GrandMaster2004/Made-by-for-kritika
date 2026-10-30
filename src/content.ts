/**
 * Every word RTTiwa reads lives here, so the wording can be tweaked
 * without touching any component logic.
 */

export const NAMES = {
  her: 'RTTiwa',
  me: 'Yash',
} as const;

export interface Question {
  
  readonly id: number;
  /** Emoji shown in the round badge above the question. */
  readonly badge: string;
  /** Small playful label above the question. */
  readonly tag: string;
  /** The question itself. */
  readonly text: string;
  /** A softer line under the question. */
  readonly note: string;
  /** What she sees right after tapping YES. */
  readonly reaction: string;
  readonly reactionEmoji: string;
}

/** The date invitation first, then five playful follow-ups about the date. */
export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    badge: '💌',
    tag: 'Round 1 · The most important question',
    text: 'RTTiwa, when I come to Thailand in March 2027… will you go on a romantic date with me?',
    note: 'Just you, me, and one evening we will never forget. 🌇✨',
    reaction: 'SHE SAID YES!! Okay, okay… calm down, Yash. A few more questions to go. 🙈',
    reactionEmoji: '🎉',
  },
  {
    id: 2,
    badge: '🔍',
    tag: 'Round 2 · A serious investigation',
    text: 'Be honest… do you know your smile should be illegal?',
    note: 'It steals my heart every single time, and nobody ever arrests you. 🙈',
    reaction: 'Guilty! Your sentence: one date with Yash. Oh wait… that is already booked. ⚖️',
    reactionEmoji: '😌',
  },
  {
    id: 3,
    badge: '🛬',
    tag: 'Round 3 · Arrivals',
    text: 'Delhi to Bangkok is about four hours by plane. Will you be waiting for me when I land?',
    note: 'I will be the guy at arrivals grinning like an idiot, holding a sign that says ที่รัก. 🪧',
    reaction: 'Countdown started! Every day until March just got a little longer. ⏳💗',
    reactionEmoji: '🥹',
  },
  {
    id: 4,
    badge: '🥭',
    tag: 'Round 4 · Food test',
    text: 'Will you take me for mango sticky rice and boat noodles, and laugh when I cannot handle the spice?',
    note: 'I will say ไม่เผ็ด (not spicy) and still cry. You will have to hold my hand. 🌶️',
    reaction: 'Deal! You order, I pay, and the biggest piece of mango is yours. 🥭',
    reactionEmoji: '😋',
  },
  {
    id: 5,
    badge: '🎡',
    tag: 'Round 5 · Your side of Thailand',
    text: 'Future Park, Dream World, a sunset by the Chao Phraya… will you show me your side of Thailand?',
    note: 'I have seen the photos. I want the version with you in it. 📸',
    reaction: 'Yay! Official tour guide: RTTiwa. I will carry the bags and the snacks. 🎒',
    reactionEmoji: '🫶',
  },
  {
    id: 6,
    badge: '💃',
    tag: 'Round 6 · Last one, promise',
    text: 'And if a song comes on… will you dance with me, even though I have zero moves?',
    note: 'Holding your hand the whole night is non-negotiable. Laughing at my dancing is allowed. 😂',
    reaction: 'Six YESes! My heart cannot take this. 🫶',
    reactionEmoji: '🕺',
  },
];

/**
 * Every time she tries NO, she earns one of these (in order, then it loops).
 * They add up into a "punishment bill" on the celebration screen.
 */
export interface Punishment {
  readonly icon: string;
  readonly amount: number;
  /** [singular, plural] */
  readonly unit: readonly [string, string];
  /** What she sees under the buttons right after trying NO. */
  readonly tease: string;
}

export const PUNISHMENTS: readonly Punishment[] = [
  {
    icon: '🤗',
    amount: 10,
    unit: ['hug', 'hugs'],
    tease: 'Nice try! 😜 Punishment: you owe me 10 hugs.',
  },
  {
    icon: '🥭',
    amount: 1,
    unit: ['plate of mango sticky rice', 'plates of mango sticky rice'],
    tease: 'Not allowed! Punishment: one ข้าวเหนียวมะม่วง, your treat. 🥭',
  },
  {
    icon: '📸',
    amount: 5,
    unit: ['selfie with your cutest smile', 'selfies with your cutest smile'],
    tease: 'Caught you! Punishment: 5 selfies with your cutest smile. 📸',
  },
  {
    icon: '🤝',
    amount: 1,
    unit: ['evening of holding my hand', 'evenings of holding my hand'],
    tease: 'Punishment: you hold my hand for the whole evening. No escape. 🤝',
  },
  {
    icon: '💃',
    amount: 1,
    unit: ['slow dance', 'slow dances'],
    tease: 'That NO is shy, just like you. Punishment: one slow dance with me. 💃',
  },
  {
    icon: '🗣️',
    amount: 3,
    unit: ['Thai word you teach me', 'Thai words you teach me'],
    tease: 'Punishment: you teach me 3 new Thai words. Starting with น่ารัก. 😌',
  },
  {
    icon: '🍿',
    amount: 1,
    unit: ['movie night where you share your popcorn', 'movie nights where you share your popcorn'],
    tease: 'Punishment: a movie night, and you share your popcorn. 🍿',
  },
];

export const UI = {
  progress: (current: number, total: number) =>
    total === 1 ? 'Just one question 💌' : `Question ${current} of ${total}`,
  nextQuestion: 'Next question coming',
  lastQuestion: 'A little surprise is coming',
} as const;

export const WELCOME = {
  kicker: 'Psst… this little world was made just for you ✨',
  hey: 'Heyyy, my beautiful',
  name: 'RTTiwa!',
  lines: [
    'สวัสดีครับ ที่รัก 🙏 Do you know how special your smile makes me feel, all the way from Delhi? 👀💗',
    'So I made you something: a few little questions for my favourite girl. Hehe! 🙈',
  ],
  ready: 'So, my princess… ready?',
  cta: "Let's Begin, Baby ❤️",
  signature: 'with way too much love, Yash 🧸',
} as const;

export const CELEBRATION = {
  pill: "IT'S A DATE, MY PRINCESS! 🌹",
  chapter: 'In March 2027, we start a beautiful new chapter of our little love story in Thailand. 🌴❤️',
  plan: [
    { icon: '💬', label: 'Cute conversations' },
    { icon: '🌇', label: 'Romantic walks' },
    { icon: '🥭', label: 'Mango sticky rice' },
    { icon: '💃', label: 'Dancing together' },
    { icon: '😂', label: 'Lots of laughter' },
    { icon: '📸', label: 'Beautiful memories' },
  ],
  billTitle: '🧾 Your punishment bill',
  billNote: 'Payable in March 2027. No refunds. 😌',
  billEmpty: 'Punishment bill: zero. You never even tried to say NO. 🥹',
  future: 'And maybe one day… a little home, a lot of love, and a family of our own. 🏡💞',
  closing: "I can't wait to see your beautiful smile in person and spend some special time with you.",
  signature: 'Your date partner, Yash ❤️',
  finaleSub: 'Our Little Date Story Begins!',
  hugButton: 'One More Hug? 🧸❤️',
  restart: '↺ Watch it again?',
} as const;

export const HUG = {
  title: 'A big, tight hug! 🤗',
  thanks: 'Aww, thank you 🥹',
  label: 'A virtual hug from Yash',
  messages: [
    'Here is a tight hug! The real one comes in March, promise. 🤗',
    'A warm, cozy กอด to keep until I land in Bangkok. 🧸',
    'Long day? Here is another one. คิดถึงนะ 💗',
    'Infinite hugs unlocked, from Yash. Unlimited. ♾️❤️',
  ],
} as const;
