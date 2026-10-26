/**
 * Every word Kritika reads lives here, so the wording can be tweaked
 * without touching any component logic.
 */

export interface Question {
  /** Stable id, also used as the React key. */
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
    tag: 'Round 1 · Sabse important sawaal',
    text: 'Kritika, Diwali 2026 ke baad… kya tum mere saath ek romantic date pe chalogi?',
    note: 'Bas tum, main, Shimla ki pahadiyaan, aur ek shaam jo hum dono kabhi nahi bhoolenge. 🌄✨',
    reaction: 'SHE SAID YES!! Okay okay, calm down Yash… abhi kuch aur sawaal baaki hain. 🙈',
    reactionEmoji: '🎉',
  },
  {
    id: 2,
    badge: '🔍',
    tag: 'Round 2 · Ek serious investigation',
    text: 'Kritika, sach sach batana… kya tumhe pata hai ki tumhari smile ek full-time crime hai?',
    note: 'Roz mera dil chura leti hai, aur ek bhi FIR nahi hoti. 🙈',
    reaction: 'Guilty as charged! Saza: Yash ke saath ek date. Oh wait… woh toh already pakki hai. ⚖️',
    reactionEmoji: '😌',
  },
  {
    id: 3,
    badge: '🩺',
    tag: 'Round 3 · Medical emergency',
    text: 'Nurse madam, ek urgent case hai — tumhari aankhon mein dekhte hi mera heartbeat 120 cross kar jaata hai. Ye case personally handle karogi?',
    note: 'First year mein hi itna serious patient… sorry, madam ji. 😅',
    reaction: 'Diagnosis: Kritika-itis. Treatment: roz thodi si smile, aur bahut saara time saath. 💊💗',
    reactionEmoji: '🥰',
  },
  {
    id: 4,
    badge: '🍫',
    tag: 'Round 4 · Sweet tooth check',
    text: 'Meri ek theory hai: tumhare lips pe jo smile aati hai na, woh kisi bhi chocolate se zyada sweet hai. Toh… date pe mere saath chocolates share karogi?',
    note: 'Bada wala piece tumhara. Yahi hota hai sacha pyaar. 🫶',
    reaction: 'Deal pakki! Pehla bite bhi tumhara, aakhri bhi. Main bas tumhe khush dekh ke khush ho jaunga. 🥹',
    reactionEmoji: '🍫',
  },
  {
    id: 5,
    badge: '🌹',
    tag: 'Round 5 · Ek chhoti si wish',
    text: 'Bilkul no pressure, bas ek cute si request… Hamari date pe red dress pehnogi?',
    note: 'Mujhe lagta hai red colour bana hi tumhare liye hai. Waise tum jo bhi pehno, sabse pyaari tum hi lagogi. ❤️',
    reaction: 'Uff! Shimla ki thand ka ab koi chance hi nahi. Main abhi se nervous hoon. 🌹',
    reactionEmoji: '🥵',
  },
  {
    id: 6,
    badge: '🏔️',
    tag: 'Round 6 · Shimla calling',
    text: 'Mall Road ki evening lights, Ridge pe thandi hawa, aur haathon mein haath… Mere saath poora Shimla ghoomna padega, madam ji! Chalogi?',
    note: 'Aur agar kahin gaana baja, toh ek chhota sa dance bhi. Mere dance moves pe hasna allowed hai. 😂💃',
    reaction: 'Yayy! Thand lagi toh mera haath bhi ready hai, aur meri jacket bhi. Dance practice aaj se shuru. 🕺',
    reactionEmoji: '🫶',
  },
];

/** Little teases shown while the NO button runs away. Never mean, never guilt. */
export const NO_TEASES: readonly string[] = [
  'Arre arre! NO button ko bhi pata hai ki answer YES hai. 😂',
  'Ye button aaj chhutti pe hai, madam ji. 🏖️',
  'Pakad ke dikhao! (Spoiler: nahi pakda jayega 😜)',
  'YES wala button bechara lonely feel kar raha hai. 🥺',
  'Shimla ki thand mein NO freeze ho gaya. ❄️',
  'Try karte hue bhi kitni cute lag rahi ho. 😌',
  'Ye NO bhi tumhari tarah thoda shy hai. 🫣',
];

export const WELCOME = {
  kicker: 'Psst… ye chhoti si duniya sirf tumhare liye bani hai ✨',
  hey: 'Heyyy, my beautiful',
  name: 'Kritika!',
  lines: [
    'Pata hai, tumhari gorgeous eyes aur woh cute si smile mere dil ko kitna special feel karwati hain? 👀💗',
    'Isliye aaj tumhare liye kuch banaya hai — bas kuch little questions, meri favourite girl ke liye. Hehe! 🙈💗',
  ],
  ready: 'Toh, meri princess… ready ho?',
  cta: "Let's Begin, Baby ❤️",
  signature: 'with way too much love, Yash 🧸',
} as const;

export const CELEBRATION = {
  pill: "IT'S A DATE, MERI PRINCESS! 🌹",
  chapter:
    'Diwali ke baad hum dono Shimla mein apni little love story ka ek beautiful chapter shuru karenge. ❄️❤️',
  plan: [
    { icon: '💬', label: 'Cute conversations' },
    { icon: '🏔️', label: 'Romantic walks' },
    { icon: '🍫', label: 'Chocolates' },
    { icon: '💃', label: 'Dancing together' },
    { icon: '😂', label: 'Lots of laughter' },
    { icon: '📸', label: 'Beautiful memories' },
  ],
  closing: "I can't wait to see your beautiful smile and spend some special time with you.",
  signature: 'Your date partner, Yash ❤️',
  finaleSub: 'Our Little Date Story Begins!',
  hugButton: 'One More Hug? 🧸❤️',
  restart: '↺ Ek baar aur dekhna hai?',
} as const;

export const HUG_MESSAGES: readonly string[] = [
  'Ye lo, ek tight wali jhappi! Asli wali Shimla mein milegi, promise. 🤗',
  'Hostel ki thand ke liye ek extra warm, extra cozy hug. 🧸❄️',
  'Padhai ka stress? Lo, ek aur jhappi. Nurse madam ko bhi care chahiye. 🩺💗',
  'Infinite hugs unlocked — Yash ki taraf se, unlimited. ♾️❤️',
];
