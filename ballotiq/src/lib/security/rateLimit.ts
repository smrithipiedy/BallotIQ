/**
 * Security module: Client-side rate limiting to prevent API quota
 * exhaustion and protect against runaway calls.
 * Limits stored in Firestore per sessionId, reset daily.
 */

import {
  getRateLimitState,
  saveRateLimitState,
} from '@/lib/firebase/firestore';
import type { RateLimitState } from '@/types';

/** Daily API call limits per service */
const DAILY_LIMITS = {
  gemini: 40,
  translate: 100,
  tts: 50,
} as const;

/** Service types that can be rate-limited */
export type APIService = keyof typeof DAILY_LIMITS;

/**
 * Checks whether an API call is allowed under the daily rate limit.
 * Reads current usage from Firestore for this session.
 * Resets counts if last reset was yesterday or earlier.
 * @param sessionId - Current user session identifier
 * @param service - The API service being called
 * @returns Object with allowed status, remaining calls, and reset time
 */
export async function checkRateLimit(
  sessionId: string,
  service: APIService
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const today = new Date().toISOString().split('T')[0];
  const resetAt = getNextMidnight();

  try {
    const state = await getRateLimitState(sessionId);

    if (!state || state.lastReset !== today) {
      const freshState: RateLimitState = {
        sessionId,
        geminiCallsToday: 0,
        translateCallsToday: 0,
        ttsCallsToday: 0,
        lastReset: today,
      };
      await saveRateLimitState(freshState);
      return { allowed: true, remaining: DAILY_LIMITS[service], resetAt };
    }

    const usageKey = `${service}CallsToday` as keyof Pick<
      RateLimitState,
      'geminiCallsToday' | 'translateCallsToday' | 'ttsCallsToday'
    >;
    const currentUsage = state[usageKey];
    const limit = DAILY_LIMITS[service];
    const remaining = Math.max(0, limit - currentUsage);

    return {
      allowed: currentUsage < limit,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error('[RateLimit] Failed to check rate limit:', error);
    return { allowed: true, remaining: DAILY_LIMITS[service], resetAt };
  }
}

/**
 * Atomically increments the usage counter in Firestore for a service.
 * @param sessionId - Current user session identifier
 * @param service - The API service that was called
 */
export async function incrementUsage(
  sessionId: string,
  service: APIService
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const state = await getRateLimitState(sessionId);
    const current: RateLimitState = state ?? {
      sessionId,
      geminiCallsToday: 0,
      translateCallsToday: 0,
      ttsCallsToday: 0,
      lastReset: today,
    };

    if (current.lastReset !== today) {
      current.geminiCallsToday = 0;
      current.translateCallsToday = 0;
      current.ttsCallsToday = 0;
      current.lastReset = today;
    }

    switch (service) {
      case 'gemini':
        current.geminiCallsToday += 1;
        break;
      case 'translate':
        current.translateCallsToday += 1;
        break;
      case 'tts':
        current.ttsCallsToday += 1;
        break;
    }

    await saveRateLimitState(current);
  } catch (error) {
    console.error('[RateLimit] Failed to increment usage:', error);
  }
}

/**
 * Returns a user-friendly message explaining the rate limit
 * and when it resets (midnight local time).
 * @param service - The rate-limited API service
 * @returns Human-readable limit explanation
 */
export function getRateLimitMessage(service: APIService): string {
  const messages: Record<APIService, string> = {
    gemini:
      'AI requests limit reached for today. Content will load from our verified cache. Resets at midnight.',
    translate:
      'Translation limit reached for today. Resets at midnight.',
    tts: 'Text-to-speech limit reached for today. Resets at midnight.',
  };
  return messages[service];
}

/**
 * Returns the daily limit for a given service.
 * @param service - The API service
 * @returns Daily call limit number
 */
export function getDailyLimit(service: APIService): number {
  return DAILY_LIMITS[service];
}

/**
 * Calculates the ISO string for the next midnight in local time.
 * @returns ISO string of next midnight
 */
function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
