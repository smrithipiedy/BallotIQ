import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// Node's `util` TextDecoder types can differ from the browser global in TS lib.
// Cast via `globalThis.TextDecoder` to satisfy type-checking.
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;

// Mock Firebase
jest.mock('firebase/performance', () => ({
  getPerformance: jest.fn(),
  trace: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    putAttribute: jest.fn(),
    incrementMetric: jest.fn(),
  })),
}));

jest.mock('@/lib/firebase/client', () => ({
  getFirebaseApp: jest.fn(),
  getFirestoreDB: jest.fn(),
  getFirebaseAuth: jest.fn(),
  ensureAnonymousAuth: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
  onAuthChange: jest.fn(),
  app: { name: '[DEFAULT]' },
  authReady: Promise.resolve(),
}));

jest.mock('@/context/TranslationContext', () => ({
  useTranslation: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    translate: (text: string) => Promise.resolve(text),
    translateMany: (texts: string[]) => Promise.resolve(texts),
    isTranslating: false,
  }),
  TranslationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/firebase/firestore', () => ({
  saveUserContext: jest.fn().mockResolvedValue(undefined),
  getUserContext: jest.fn().mockResolvedValue(null),
  cacheElectionGuide: jest.fn().mockResolvedValue(undefined),
  getCachedGuide: jest.fn().mockResolvedValue(null),
  saveProgress: jest.fn().mockResolvedValue(undefined),
  getProgress: jest.fn().mockResolvedValue(null),
  saveChatMessage: jest.fn().mockResolvedValue(undefined),
  getChatHistory: jest.fn().mockResolvedValue([]),
  saveRateLimitState: jest.fn().mockResolvedValue(undefined),
  getRateLimitState: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/firebase/analytics', () => ({
  logAssessmentComplete: jest.fn().mockResolvedValue(undefined),
  logStepComplete: jest.fn().mockResolvedValue(undefined),
  logMicroQuizResult: jest.fn().mockResolvedValue(undefined),
  logAdaptationTriggered: jest.fn().mockResolvedValue(undefined),
  logQuizComplete: jest.fn().mockResolvedValue(undefined),
  logLanguageChanged: jest.fn().mockResolvedValue(undefined),
  logAssistantQuestion: jest.fn().mockResolvedValue(undefined),
}));

// Mock Translation Context
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    translate: (key: string) => key,
  }),
}));

jest.mock('@/context/TranslationContext', () => ({
  TranslationProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslation: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    translate: (key: string) => key,
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
