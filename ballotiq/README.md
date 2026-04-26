# BallotIQ 🗳️ — Adaptive Civics AI

**BallotIQ** is a high-performance, personalized election education platform built for the PromptWars Virtual Hackathon. It leverages Google Gemini 1.5 Flash to transform complex election procedures into digestible, adaptive learning paths tailored to each user's country, knowledge level, and language.

## 🚀 Key Features

- **Adaptive Learning Loop**: Diagnostic assessment determines your knowledge level (Beginner, Intermediate, Advanced) and builds a personalized curriculum.
- **Intelligence Layer**: Detects when users struggle with micro-quizzes and automatically simplifies content ("Adaptation Mode").
- **Global Coverage**: Deep support for 8 major democracies (India, USA, UK, Canada, Australia, Brazil, South Africa, Nigeria).
- **8 Native Languages**: Full platform translation into Hindi, Bengali, Telugu, Tamil, Spanish, French, and Portuguese.
- **Multi-Tier Reliability**: Three-tier content delivery (Live API → Firestore Cache → Static Fallback) ensures 100% uptime.
- **Accessibility First**: Integrated Google Cloud TTS for all content, high-contrast dark theme, and WCAG-compliant navigation with automated `jest-axe` validation.

## 🛠️ Google Services Integration

1. **Gemini 1.5 Flash**: Core adaptive learning engine, diagnostic analysis, and personalized quiz generation.
2. **Firebase Firestore**: Real-time session persistence, global content caching, and progress tracking.
3. **Firebase Auth**: Anonymous authentication for secure, isolated user sessions.
4. **Google Cloud Translation**: Dynamic UI and content translation for 8 native languages.
5. **Google Cloud Text-to-Speech**: High-quality voice synthesis for improved accessibility.
6. **Google Maps Places API**: Location-aware polling station finder with dark-themed visualization.
7. **Google Analytics (Firebase)**: Comprehensive tracking of learning milestones and user engagement.

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **AI**: Google Gemini 1.5 Flash (Learning, Analysis, Quizzing)
- **Database**: Firebase (Firestore for Caching, Sessions, Progress)
- **Security**: Dedicated sanitization layer (XSS/Injection protection) and client-side Rate Limiting.
- **Styling**: Tailwind CSS v4 with premium dark-mode aesthetics.
- **Testing**: Jest & React Testing Library (50+ test cases).

## 📦 Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_TRANSLATE_API_KEY=your_key
   NEXT_PUBLIC_TTS_API_KEY=your_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. **Build & Export**:
   ```bash
   npm run build
   ```

## 🧪 Testing

The project includes a comprehensive test suite covering security, validation, and core components:
```bash
npm test
```

## 🛡️ Security

BallotIQ implements rigorous security standards:
- **Sanitization**: All AI outputs and user inputs pass through a strict sanitization pipeline.
- **Rate Limiting**: Usage-based limits for Gemini, Translate, and TTS APIs to prevent quota exhaustion.
- **Isolation**: Firestore security rules ensure users can only access their own session data.

---
*Built with ❤️ for PromptWars Virtual — Empowering voters through intelligence.*
