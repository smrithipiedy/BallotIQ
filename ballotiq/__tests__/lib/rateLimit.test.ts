/**
 * Tests for client-side rate limiting module.
 */

import { getRateLimitMessage, getDailyLimit } from '@/lib/security/rateLimit';
import type { APIService } from '@/lib/security/rateLimit';

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
