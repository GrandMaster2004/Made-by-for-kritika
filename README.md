# For Kritika ❤️ — a little date proposal from Yash

A tiny romantic world, built for one person: a dreamy welcome, six playful
YES/NO questions (with a very shy NO button), and a celebration for the date
in Shimla after Diwali 2026.

Built with **React 19 + Vite + TypeScript (TSX) + Tailwind CSS v4**.
No backend, no database, no image or audio files — every illustration is
inline SVG/emoji and the music is synthesised live in the browser.

---

## Run it locally

You need **Node.js 20.19+** (Node 22 LTS recommended). Check with `node -v`.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

**Try it on your phone** (same Wi-Fi as your computer):

```bash
npm run dev -- --host
```

Then open the `Network:` URL Vite prints on your phone.

## Build for production

```bash
npm run build     # type-checks (tsc -b), then builds to dist/
npm run preview   # serves the production build locally
```

## Deploy to Vercel

**Option A — GitHub (easiest)**

1. Push this folder to a new GitHub repository.
2. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the repo.
3. Vercel detects Vite automatically (Build: `npm run build`, Output: `dist`). Click **Deploy**.

**Option B — command line**

```bash
npx vercel          # first time: log in and accept the detected settings
npx vercel --prod   # publish the production URL
```

Send Kritika the link. 💌

---

## The experience

| Stage | What happens |
| --- | --- |
| **Welcome** | Floating hearts, sparkles, a blinking teddy holding a heart, and the "Let's Begin, Baby ❤️" button. |
| **6 questions** | One at a time with a "Question X of 6" heart tracker. It opens with the date invitation ("Kritika, Diwali 2026 ke baad… kya tum mere saath ek romantic date pe chalogi?"), then five playful follow-ups. **YES** plays a cute reaction and moves on; after the sixth, the celebration opens. **NO** runs away. |
| **Celebration** | Confetti of hearts and roses, the date plan, "Kritika ❤️ Yash — Our Little Date Story Begins!", and a "One More Hug? 🧸❤️" button. |

**The shy NO button**

- Desktop: it hops away as soon as the cursor gets close.
- Phone/tablet: a tap is cancelled (no click is generated) and it hops away.
- It only ever lands fully on screen, clear of notches/home bars, and never over
  YES, the question text, the progress tracker or the music button.
- It re-checks its spot on resize, rotation, scrolling and mobile address-bar changes.
- Its click handler has no path to answering — only YES moves forward.

**Music** is an original music-box lullaby generated with the Web Audio API.
It is off until she taps the 🎵 button (top-right), pauses when the phone is
locked or the tab is hidden, and if a browser has no Web Audio the button
simply doesn't appear — everything else works the same.

**Accessibility**: big touch targets, readable text at every size, safe-area
padding for notched phones, keyboard-friendly buttons, and full support for
the system "Reduce motion" setting (decorations go still, the NO button hops
instantly instead of flying).

---

## Make it yours

All the words live in **`src/content.ts`** — the six questions and their
reactions, the NO-button teases, the celebration and the hug messages. Edit
them there; no component code needs to change. Add or remove entries in
`QUESTIONS` and the "Question X of Y" tracker adjusts on its own (with a single
question it reads "Bas ek sawaal").

## Project structure

```
src/
  main.tsx                 entry point
  App.tsx                  stage machine: welcome → questions → celebration
  content.ts               every line of copy
  index.css                Tailwind v4 theme tokens, component styles, animations
  screens/
    Welcome.tsx
    Questions.tsx          question card, progress, YES reaction
    Celebration.tsx        celebration, confetti, hug overlay
  components/
    DodgingNoButton.tsx    the runaway NO button
    Background.tsx         floating hearts and sparkles per scene
    SoundToggle.tsx        mute / unmute control
    Burst.tsx              heart burst on YES
    art.tsx                SVG teddy, hearts, sparkles, icons
  lib/
    geometry.ts            safe-spot search for the NO button
    sound.ts               Web Audio music + sound effects
    style.ts               small helpers
  hooks/useReducedMotion.ts
  sound/SoundProvider.tsx
```

## Notes

- Fonts (Playfair Display, Dancing Script, Nunito) load from Google Fonts with
  sensible fallbacks, so the page still looks good if they can't load.
- Framer Motion and Lucide were left out on purpose: CSS animations, the Web
  Animations API and inline SVG icons cover everything with fewer dependencies.
