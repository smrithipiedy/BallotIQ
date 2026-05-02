/**
 * Tests for client-side rate limiting module.
 */

import { getRateLimitMessage, getDailyLimit, checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';
import type { APIService } from '@/lib/security/rateLimit';
import { getRateLimitState, saveRateLimitState } from '@/lib/firebase/firestore';

jest.mock('@/lib/firebase/firestore', () => ({
  getRateLimitState: jest.fn<Promise<null>, []>().mockResolvedValue(null),
  saveRateLimitState: jest.fn(),
}));

describe('getRateLimitMessage', () => {
  it('returns a message for gemini service', () => {
    const msg = getRateLimitMessage('gemini');
    expect(msg).toContain('AI requests limit');
    expect(msg).toContain('midnight');
  });

  it('returns a message for translate service', () => {
    const msg = getRateLimitMessage('translate');
    expect(msg).toContain('Translation limit');
  });

  it('returns a message for tts service', () => {
    const msg = getRateLimitMessage('tts');
    expect(msg).toContain('Text-to-speech limit');
  });

  it('returns a string for each valid service', () => {
    const services: APIService[] = ['gemini', 'translate', 'tts'];
    services.forEach((service) => {
      expect(typeof getRateLimitMessage(service)).toBe('string');
      expect(getRateLimitMessage(service).length).toBeGreaterThan(0);
    });
  });
});

describe('getDailyLimit', () => {
  it('returns 40 for gemini', () => {
    expect(getDailyLimit('gemini')).toBe(40);
  });

  it('returns 100 for translate', () => {
    expect(getDailyLimit('translate')).toBe(100);
  });

  it('returns 50 for tts', () => {
    expect(getDailyLimit('tts')).toBe(50);
  });

  it('returns positive integers for all services', () => {
    const services: APIService[] = ['gemini', 'translate', 'tts'];
    services.forEach((service) => {
      const limit = getDailyLimit(service);
      expect(limit).toBeGreaterThan(0);
      expect(Number.isInteger(limit)).toBe(true);
    });
  });
});

describe('checkRateLimit', () => {
  const sessionId = 'test-session';
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { allowed: true, remaining: 39 } when usage is below limit', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 1,
      lastReset: today
    });

    const result = await checkRateLimit(sessionId, 'gemini');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(39);
  });

  it('returns { allowed: false, remaining: 0 } when usage is at limit', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 40,
      lastReset: today
    });

    const result = await checkRateLimit(sessionId, 'gemini');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets count and returns allowed when lastReset was yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 40,
      lastReset: yesterdayStr
    });

    const result = await checkRateLimit(sessionId, 'gemini');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(40);
    expect(saveRateLimitState).toHaveBeenCalled();
  });

  it('returns allowed when Firestore throws (graceful degradation)', async () => {
    (getRateLimitState as jest.Mock).mockRejectedValue(new Error('Firestore down'));

    const result = await checkRateLimit(sessionId, 'gemini');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(40);
  });
});

describe('incrementUsage', () => {
  const sessionId = 'test-session';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Firestore increment', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 5,
      lastReset: new Date().toISOString().split('T')[0]
    });

    await incrementUsage(sessionId, 'gemini');
    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      geminiCallsToday: 6
    }));
  });

  it('handles Firestore failure silently', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 5,
      lastReset: new Date().toISOString().split('T')[0]
    });
    (saveRateLimitState as jest.Mock).mockRejectedValue(new Error('Write failed'));

    // Should not throw
    await expect(incrementUsage(sessionId, 'gemini')).resolves.not.toThrow();
  });

  it('resets counts if incrementing on a new day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    (getRateLimitState as jest.Mock).mockResolvedValue({
      geminiCallsToday: 10,
      translateCallsToday: 20,
      ttsCallsToday: 30,
      lastReset: yesterdayStr
    });

    await incrementUsage(sessionId, 'gemini');
    
    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      geminiCallsToday: 1, // 0 + 1
      translateCallsToday: 0,
      ttsCallsToday: 0,
      lastReset: new Date().toISOString().split('T')[0]
    }));
  });

  it('increments translate service correctly', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      translateCallsToday: 5,
      lastReset: new Date().toISOString().split('T')[0]
    });

    await incrementUsage(sessionId, 'translate');
    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      translateCallsToday: 6
    }));
  });

  it('increments tts service correctly', async () => {
    (getRateLimitState as jest.Mock).mockResolvedValue({
      ttsCallsToday: 5,
      lastReset: new Date().toISOString().split('T')[0]
    });

    await incrementUsage(sessionId, 'tts');
    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      ttsCallsToday: 6
    }));
  });
});
