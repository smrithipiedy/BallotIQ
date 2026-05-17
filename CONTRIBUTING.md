# Contributing to BallotIQ

Thank you for your interest in contributing to **BallotIQ**! 🗳️

BallotIQ is a non-partisan, adaptive AI civic-education platform. Every contribution — whether it's a bug fix, a new country's fallback content, a UI improvement, or a test — helps empower voters around the world.

Please read this guide fully before submitting anything. It will save both of us time.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Types of Contributions](#types-of-contributions)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Commit Message Convention](#commit-message-convention)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Non-Partisanship Policy](#non-partisanship-policy)
- [Questions & Support](#questions--support)

---

## Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Please read it before contributing.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A Google Cloud project with the required APIs enabled (see [Environment Variables](#environment-variables))

### Fork & Clone

```bash
# 1. Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/BallotIQ.git
cd BallotIQ/ballotiq

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local
# Fill in your own API keys (see Environment Variables section)

# 4. Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Project Structure

```
BallotIQ/
├── ballotiq/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React UI components
│   │   │   ├── Home/
│   │   │   ├── Journey/
│   │   │   ├── Assistant/
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks (useAssessment, useTTS, etc.)
│   │   ├── lib/
│   │   │   ├── gemini/       # Gemini API calls & prompt logic
│   │   │   │   └── fallback/ # Per-country static fallback content
│   │   │   ├── assistant/    # Intent engine & FAQ database
│   │   │   ├── firebase/     # Firestore, Auth, Analytics
│   │   │   └── ...
│   │   └── types/            # Shared TypeScript types
│   └── __tests__/            # Jest test suite (50+ cases)
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes.** Follow the code style already in use (TypeScript strict mode, functional React components, no `any` types).

3. **Write or update tests** for any logic you add or change (see [Testing](#testing)).

4. **Run the full test suite** before committing:
   ```bash
   npm test
   ```

5. **Run the linter:**
   ```bash
   npm run lint
   ```

6. **Open a Pull Request** against `main`.

---

## Types of Contributions

### 🐛 Bug Reports
Open a GitHub Issue with:
- A clear title
- Steps to reproduce
- Expected vs. actual behavior
- Browser, OS, and Node version
- Any relevant console errors or screenshots

### 🌍 Adding a New Country
BallotIQ currently supports 8 countries. To add a new one:

1. Create a fallback file at `src/lib/gemini/fallback/<country>.ts` following the structure of an existing file (e.g., `india.ts`).
2. Add the country to the country selector configuration.
3. Add relevant FAQ entries to `src/lib/assistant/faqDatabase.ts`.
4. Ensure all content is strictly non-partisan and factually accurate. Cite your sources in a code comment.
5. Add tests covering the new fallback content.

> [!IMPORTANT]
> All country content must be verifiably factual, sourced from official government or electoral commission publications, and completely non-partisan.

### ✨ Feature Requests
Open a GitHub Issue tagged `enhancement`. Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

For significant features, wait for maintainer approval before investing time in implementation.

### 📝 Documentation
Documentation improvements are always welcome. This includes the README, inline code comments, JSDoc, and this file.

### 🧪 Tests
Additional test coverage is highly valued. Tests live in `__tests__/` mirroring the `src/` structure. See [Testing](#testing).

### 🎨 UI / Accessibility
UI contributions should:
- Maintain the existing design system (colors, spacing, typography tokens in `globals.css`)
- Preserve or improve accessibility (ARIA labels, keyboard navigation, color contrast)
- Be responsive across mobile, tablet, and desktop

---

## Submitting a Pull Request

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. Verify all tests pass and there are no lint errors.

3. Open your PR with:
   - A descriptive title (`feat:`, `fix:`, `docs:`, `test:`, `chore:` prefix)
   - A summary of **what** changed and **why**
   - Reference to the issue it closes (`Closes #123`)
   - Screenshots for any UI changes

4. A maintainer will review your PR. Please respond to feedback promptly.

> [!NOTE]
> Small, focused PRs are reviewed much faster than large ones. Prefer one logical change per PR.

---

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: Closes #<issue>]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**
```
feat(fallback): add Australia election guide content
fix(tts): handle rate limit errors gracefully in useTTS hook
test(assessment): add edge cases for knowledge level scoring
docs(contributing): clarify country addition workflow
```

---

## Testing

BallotIQ uses **Jest** with **React Testing Library**.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- __tests__/hooks/useTTS.test.ts

# Check coverage
npm test -- --coverage
```

**Guidelines:**
- Every new utility function or hook must have unit tests.
- Every new component must have at minimum a render test.
- AI prompt logic in `src/lib/gemini/` should have tests that mock the Gemini API and validate the response parsing/validation layer.
- Do not commit failing tests.

---

## Environment Variables

BallotIQ requires several Google Cloud API keys. Each key is load-bearing — the app will not function without them.

| Variable | Service |
|---|---|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Gemini 2.5 Flash (AI core) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics |
| `NEXT_PUBLIC_TRANSLATE_API_KEY` | Google Cloud Translation |
| `NEXT_PUBLIC_TTS_API_KEY` | Google Cloud Text-to-Speech |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps Places API |

> [!CAUTION]
> Never commit API keys or `.env.local` to the repository. The `.gitignore` already excludes it, but double-check before pushing.

For testing without real API calls, mock the relevant modules in your test files (see existing `__tests__/` examples).

---

## Non-Partisanship Policy

BallotIQ is strictly **non-partisan and educational**. This is not just a design principle — it is a hard requirement for all contributions.

- **Do not** introduce content that favors, criticizes, or implies endorsement of any political party, candidate, ideology, or political position.
- **Do not** alter AI prompts in ways that could introduce political bias.
- **Do** cite official government or electoral commission sources for all factual claims about election processes.
- Any contribution found to introduce partisan bias will be rejected immediately, regardless of technical quality.

---

## Questions & Support

- **Bug or feature?** → Open a [GitHub Issue](https://github.com/smrithipiedy/BallotIQ/issues)
- **General question?** → Open a [GitHub Discussion](https://github.com/smrithipiedy/BallotIQ/discussions)

---

*Non-partisan • Educational only • Powered by Google Services*  
*Built with ❤️ — Empowering voters through intelligence.*
