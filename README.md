# BallotIQ 🗳️

An adaptive AI tutor & assistant that helps users understand their country's election process — personalized to their knowledge level, translated into their language, and spoken aloud in their voice. Built for **PromptWars Virtual — Week 2** 

---

## What it does

Most civic education tools treat every user the same. BallotIQ doesn't.

When you open BallotIQ, you choose how you want to learn:

- **Guided Path** — A 3-question diagnostic figures out what you already know, then Gemini builds a personalized learning path just for you. Micro-quizzes after each step check your understanding. Get two wrong in a row and the app automatically switches to simpler explanations. Finish with a certification quiz personalized to what *you* actually studied.
- **Open Chat** — Skip the structure and just talk to the AI assistant directly. Ask whatever you want about your country's election process.

The entire platform — every label, button, content block, and AI response — translates in real time into 8 languages. Google Cloud TTS then reads everything aloud in your selected language, so a Tamil-speaking first-time voter gets both the text and the audio in Tamil.

---

## Google services used

| Service | What it does in BallotIQ |
|---|---|
| **Gemini 2.1 Flash / 2.1 Flash Lite** | Assessment analysis, personalized guide generation, micro-quizzes, re-explanations, final quiz, conversational assistant, performance insights |
| **Firebase Firestore** | Session persistence, 24h guide caching, rate limit tracking, chat history |
| **Firebase Auth** | Anonymous sessions — required for all Firestore operations |
| **Firebase Analytics** | 7 custom learning events tracking the full user journey |
| **Google Cloud Translation** | Real-time full-UI translation into 8 languages |
| **Google Cloud TTS** | Reads all content aloud in the user's selected language |
| **Google Maps Places API** | Country selector autocomplete + polling station finder |

Removing any one of these breaks the app. Each is load-bearing.

---

## How the prompts evolved

Started with basic country + question prompts. Responses were generic.

Added a `UserContext` object — knowledge level, main confusion, completed steps, adaptation status — and passed it to every Gemini call. Responses became meaningfully different between a beginner and an advanced user asking the same question.

Switched all structured outputs to JSON-only with explicit instructions and no markdown fences. Built a `validator.ts` with type guards on every response so malformed AI output never crashes the app.

Early builds hit rate limits because multiple Gemini calls fired simultaneously on page load. Fixed with a concurrency limiter (max 2 concurrent) and exponential backoff before falling through to cached or static content.

---

## What GenAI handled vs. what I designed

**GenAI:** Personalized election guides for 8 countries across 3 knowledge levels, micro-quiz generation, concept re-explanation using analogies for beginners and deeper detail for advanced users, final quiz questions based on each user's actual completed steps, and the audit prompt that stress-tested the entire codebase against spec.

**Me:** The two-mode entry point (Guided vs. Open Chat), the three-tier fallback architecture, the `UserContext` schema, the Adaptation Mode trigger logic, the security layer (sanitization + rate limiting + Firestore rules), and the UI direction.

---

## Setup

```bash
git clone https://github.com/yourusername/ballotiq
cd ballotiq
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_TRANSLATE_API_KEY=
NEXT_PUBLIC_TTS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

```bash
npm run dev     # development
npm run build   # static export to /out
npm test        # 50+ test cases
```

Deployed on **Google Cloud Run**.

## Demo Screenshots

<img width="1280" height="611" alt="image" src="https://github.com/user-attachments/assets/19dc5777-068f-4aaa-8e48-45c51e611a6d" />
<img width="1280" height="614" alt="image" src="https://github.com/user-attachments/assets/f47273a7-66c2-4a46-8810-740959088a29" />
<img width="1280" height="609" alt="image" src="https://github.com/user-attachments/assets/c9824f7e-9263-4387-877c-4d6cd8b2c1ec" />
<img width="1280" height="609" alt="image" src="https://github.com/user-attachments/assets/e83f0e37-83f0-4e7d-bc1b-a188cfa88f6d" />

---

*Non-partisan • Educational only • Powered by Google Services*
*Built with ❤️ for PromptWars Virtual — Empowering voters through intelligence.*
