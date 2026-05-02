import { GoogleGenerativeAI } from '@google/generative-ai';
import { incrementUsage } from '@/lib/security/rateLimit';

jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  });
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
      HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
      BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH',
    },
  };
});

jest.mock('@/lib/firebase/client', () => ({
  authReady: Promise.resolve(),
}));

jest.mock('@/lib/security/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 39 }),
  incrementUsage: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger to avoid cluttering output
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Gemini Core API', () => {
  let callGemini: any;
  let mockGenAI: any;
  let mockModel: any;
  const originalEnv = process.env;

  beforeAll(() => {
    jest.useFakeTimers();
    process.env = { ...originalEnv, NEXT_PUBLIC_GEMINI_API_KEY: 'test-key-12345' };
    // Require the module after setting the environment variable
    const core = require('@/lib/gemini/core');
    callGemini = core.callGemini;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenAI = new GoogleGenerativeAI('key');
    mockModel = mockGenAI.getGenerativeModel({ model: 'any' });
  });

  afterAll(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  it('Returns text content when first model succeeds', async () => {
    mockModel.generateContent.mockResolvedValue({
      response: { text: () => 'test response' },
    });

    const result = await callGemini('test prompt', 'session1');
    expect(result).toBe('test response');
  });

  it('Tries next model when first returns 404', async () => {
    mockModel.generateContent
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ response: { text: () => 'fallback response' } });

    const result = await callGemini('test prompt', 'session1');
    expect(result).toBe('fallback response');
    expect(mockModel.generateContent).toHaveBeenCalledTimes(2);
  });

  it('Retries same model on 503 before moving on', async () => {
    mockModel.generateContent
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce({ response: { text: () => 'retry success' } });

    const promise = callGemini('test prompt', 'session1');
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('retry success');
  });

  it('Tries next model immediately on 429 quota hit', async () => {
    mockModel.generateContent
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ response: { text: () => 'next model response' } });

    const result = await callGemini('test prompt', 'session1');
    expect(result).toBe('next model response');
  });

  it('Returns null when all models fail', async () => {
    mockModel.generateContent.mockRejectedValue({ status: 500 });
    const result = await callGemini('test prompt', 'session1');
    expect(result).toBeNull();
  });

  it('Concurrency limiter allows max 2 concurrent requests', async () => {
    let active = 0;
    let maxSeen = 0;

    mockModel.generateContent.mockImplementation(async () => {
      active++;
      maxSeen = Math.max(maxSeen, active);
      await new Promise(resolve => setTimeout(resolve, 50));
      active--;
      return { response: { text: () => 'done' } };
    });

    const promises = [
      callGemini('p1', 's'),
      callGemini('p2', 's'),
      callGemini('p3', 's'),
      callGemini('p4', 's')
    ];

    await jest.advanceTimersByTimeAsync(300);
    await Promise.all(promises);

    expect(maxSeen).toBeLessThanOrEqual(2);
  });

  it('incrementUsage is called after successful response', async () => {
    mockModel.generateContent.mockResolvedValue({
      response: { text: () => 'success' },
    });

    await callGemini('prompt', 'session-usage');
    expect(incrementUsage).toHaveBeenCalledWith('session-usage', 'gemini');
  });

  it('incrementUsage is NOT called when all models fail', async () => {
    mockModel.generateContent.mockRejectedValue({ status: 500 });
    await callGemini('prompt', 'session-fail');
    expect(incrementUsage).not.toHaveBeenCalled();
  });

  it('callGeminiQuiz returns text content when successful', async () => {
    const { callGeminiQuiz } = require('@/lib/gemini/core');
    mockModel.generateContent.mockResolvedValue({
      response: { text: () => 'quiz response' },
    });

    const result = await callGeminiQuiz('quiz prompt', 'session-quiz');
    expect(result).toBe('quiz response');
    expect(incrementUsage).toHaveBeenCalledWith('session-quiz', 'gemini');
  });

  it('testGeminiConnection returns true when enabled', async () => {
    const { testGeminiConnection } = require('@/lib/gemini/core');
    const result = await testGeminiConnection();
    expect(result).toBe(true);
  });
});
