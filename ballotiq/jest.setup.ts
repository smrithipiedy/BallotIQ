import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('@/lib/firebase/client', () => ({
  getFirebaseApp: jest.fn(),
  getFirestoreDB: jest.fn(),
  getFirebaseAuth: jest.fn(),
  ensureAnonymousAuth: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
  onAuthChange: jest.fn(),
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
  logAssessmentComplete: jest.fn(),
  logStepComplete: jest.fn(),
  logMicroQuizResult: jest.fn(),
  logAdaptationTriggered: jest.fn(),
  logQuizComplete: jest.fn(),
  logLanguageChanged: jest.fn(),
  logAssistantQuestion: jest.fn(),
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
