# 🗳️ BallotIQ

### Learn how elections work through AI-powered, personalized education.

BallotIQ is an AI-powered election education platform that helps people understand electoral systems around the world through conversational learning, adaptive learning paths, multilingual translation, and voice accessibility.

<p align="center">

<a href="YOUR_LIVE_DEMO_LINK">
<img src="https://img.shields.io/badge/🌐_Live_Demo-8b5cf6?style=for-the-badge"/>
</a>

<a href="https://github.com/smrithipiedy/BallotIQ">
<img src="https://img.shields.io/badge/📂_Repository-181717?style=for-the-badge&logo=github"/>
</a>

</p>

---

## 📖 Why BallotIQ?

Understanding how elections work shouldn't require reading lengthy government documents or searching through scattered resources.

BallotIQ adapts civic education to every learner through AI. Instead of treating everyone the same, it personalizes explanations based on the learner's existing knowledge, communicates in their preferred language, and makes learning accessible through voice.

Whether you're a first-time voter or simply curious about another country's electoral system, BallotIQ provides an interactive learning experience rather than static information.

---

## ✨ Key Features

- 🤖 AI-powered conversational election assistant
- 🎯 Personalized learning paths generated using Gemini
- 🧠 Adaptive quizzes that adjust to learner performance
- 🌍 Real-time translation into 8 languages
- 🔊 Voice narration using Google Cloud Text-to-Speech
- 📍 Polling station discovery
- 📊 Learning analytics and progress tracking
- ☁️ Cloud-native deployment on Google Cloud

---

## 🚀 Learning Experience

BallotIQ offers two different ways to learn.

### Guided Path

A 3-question diagnostic assessment identifies what the learner already knows.

Gemini then generates a personalized learning journey consisting of bite-sized lessons and micro-quizzes.

After every lesson:

- understanding is evaluated
- explanations adapt to the learner
- incorrect answers trigger simpler explanations
- the final certification quiz is generated specifically for that learner

Every learner receives a different experience.

---

### Open Chat

Prefer learning by asking questions?

Skip the structured path and simply chat with the AI assistant.

Ask anything about your country's election process and receive contextual, conversational explanations.

---

### Built for Accessibility

Every interface element—including:

- buttons
- lesson content
- quizzes
- chat responses

is translated in real time into **8 languages**.

Google Cloud Text-to-Speech then reads every response aloud, allowing users to both **read and hear** content in their preferred language.

---

## 📸 Demo Screenshots

<img width="1280" height="614" alt="image" src="https://github.com/user-attachments/assets/f47273a7-66c2-4a46-8810-740959088a29" />

<img width="1280" height="611" alt="image" src="https://github.com/user-attachments/assets/19dc5777-068f-4aaa-8e48-45c51e611a6d" />

<img width="1280" height="609" alt="image" src="https://github.com/user-attachments/assets/c9824f7e-9263-4387-877c-4d6cd8b2c1ec" />

<img width="1280" height="609" alt="image" src="https://github.com/user-attachments/assets/e83f0e37-83f0-4e7d-bc1b-a188cfa88f6d" />

---

## 🏗️ Architecture

```
                  User
                    │
          Next.js Frontend
                    │
        ┌───────────┼────────────┐
        │           │            │
     Gemini   Translation API   Maps API
        │           │            │
        └───────────┼────────────┘
                    │
      Firebase Auth + Firestore
                    │
          Google Cloud Run
```

---

## 🛠️ Google Services Used

| Service | Purpose |
|---|---|
| **Gemini 2.5 / 3.1 Flash & Flash Lite** | Personalized learning paths, conversational assistant, adaptive quizzes, explanations, certification quiz generation and learning insights |
| **Firebase Firestore** | Session persistence, guide caching, chat history and rate-limit tracking |
| **Firebase Authentication** | Anonymous authentication for secure Firestore access |
| **Firebase Analytics** | Tracks custom learning events across the user journey |
| **Google Cloud Translation API** | Real-time translation of the complete interface into 8 languages |
| **Google Cloud Text-to-Speech** | Reads lessons and AI responses aloud in the selected language |
| **Google Maps Places API** | Country autocomplete and polling station discovery |

> Every service above is integral to the application. Removing any one of them breaks a core workflow.

---

## ⚙️ Engineering Decisions

Some implementation choices made during development:

- Cached personalized learning guides for 24 hours to reduce Gemini API usage.
- Anonymous Firebase Authentication enables persistent sessions without requiring user accounts.
- Translation happens dynamically so every interface element remains language-independent.
- Lightweight `/api/health` endpoint minimizes Cloud Run cold-start overhead during liveness checks.

---

## 🚧 Engineering Challenges

Building BallotIQ involved solving several interesting engineering problems:

- Generating meaningful personalized learning paths from only three assessment questions.
- Maintaining consistent AI responses across multiple languages.
- Combining conversational AI, translation, quizzes and voice into one seamless workflow.
- Reducing latency while orchestrating multiple Google Cloud services.

---

## ⚡ Setup

```bash
git clone https://github.com/smrithipiedy/BallotIQ
cd BallotIQ
npm install
```

Create `.env.local`

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

Run locally

```bash
npm run dev
npm run build
npm test
```

---

## ☁️ Deployment

BallotIQ is deployed on **Google Cloud Run**.

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3
```

The `/api/health` endpoint performs no database operations, ensuring extremely lightweight health checks and faster container recovery.

---

## 🚀 Roadmap

- Voice-first conversational experience
- Additional supported languages
- Election comparison across countries
- Offline learning mode
- Agentic AI tutor capable of long-term learner memory

---

## 📄 Disclaimer

BallotIQ is a non-partisan educational platform.

It does not promote political parties, candidates or ideologies. The goal is to make civic education more accessible through AI.

---

<p align="center">

Built with ❤️ using Google Cloud, Gemini and Firebase.

Empowering voters through intelligent learning.

</p>
