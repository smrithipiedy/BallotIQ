/**
 * Tests for client-side rate limiting module.
 */

import { getRateLimitMessage, getDailyLimit, checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';
import type { APIService } from '@/lib/security/rateLimit';
import type { RateLimitState } from '@/types';
import { getRateLimitState, saveRateLimitState } from '@/lib/firebase/firestore';

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
  const fixedNow = new Date('2026-04-29T12:00:00.000Z');
  const today = fixedNow.toISOString().split('T')[0];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
    (getRateLimitState as unknown as jest.Mock).mockReset();
    (saveRateLimitState as unknown as jest.Mock).mockReset();
  });

  it('initializes state when none exists', async () => {
    (getRateLimitState as unknown as jest.Mock).mockResolvedValueOnce(null);

    const res = await checkRateLimit('s1', 'gemini');

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(40);
    expect(typeof res.resetAt).toBe('string');
    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 's1',
      geminiCallsToday: 0,
      translateCallsToday: 0,
      ttsCallsToday: 0,
      lastReset: today,
    }));
  });

  it('returns allowed=false when daily limit reached', async () => {
    const state: RateLimitState = {
      sessionId: 's1',
      geminiCallsToday: 40,
      translateCallsToday: 0,
      ttsCallsToday: 0,
      lastReset: today,
    };

    (getRateLimitState as unknown as jest.Mock).mockResolvedValueOnce(state);

    const res = await checkRateLimit('s1', 'gemini');

    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(typeof res.resetAt).toBe('string');
  });

  it('falls back to allowed=true when Firestore throws', async () => {
    (getRateLimitState as unknown as jest.Mock).mockRejectedValueOnce(new Error('firestore down'));

    const res = await checkRateLimit('s1', 'gemini');
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(40);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

describe('incrementUsage', () => {
  const fixedNow = new Date('2026-04-29T12:00:00.000Z');
  const today = fixedNow.toISOString().split('T')[0];
  const yesterdayDate = new Date(fixedNow);
  yesterdayDate.setUTCDate(fixedNow.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
    (getRateLimitState as unknown as jest.Mock).mockReset();
    (saveRateLimitState as unknown as jest.Mock).mockReset();
  });

  it('increments geminiCallsToday when starting from empty state', async () => {
    (getRateLimitState as unknown as jest.Mock).mockResolvedValueOnce(null);

    await incrementUsage('s1', 'gemini');

    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 's1',
      geminiCallsToday: 1,
      translateCallsToday: 0,
      ttsCallsToday: 0,
      lastReset: today,
    }));
  });

  it('resets counts when lastReset is outdated', async () => {
    const state: RateLimitState = {
      sessionId: 's1',
      geminiCallsToday: 10,
      translateCallsToday: 2,
      ttsCallsToday: 1,
      lastReset: yesterday,
    };

    (getRateLimitState as unknown as jest.Mock).mockResolvedValueOnce(state);

    await incrementUsage('s1', 'translate');

    expect(saveRateLimitState).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 's1',
      geminiCallsToday: 0,
      translateCallsToday: 1,
      ttsCallsToday: 0,
      lastReset: today,
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
