/**
 * Election guide generation via Gemini AI.
 * Produces personalized step-by-step learning paths.
 */

import type { ElectionStep, KnowledgeLevel } from '@/types';
import { buildPersonalizedGuidePrompt } from './prompts';
import { MAX_TOKENS_LONG } from '@/lib/constants/ai';
import { parseGeminiJSON, isElectionStepsArray } from './validator';
import { getFallbackGuide } from './fallback';
import { getCachedGuide, cacheElectionGuide } from '@/lib/firebase/firestore';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { authReady } from '@/lib/firebase/client';
import { withTrace } from '@/lib/firebase/performance';
import { logger } from '@/lib/logger';
import { callGemini } from './client';

/**
 * Generates election learning steps personalized to the user's knowledge level.
 * Checks cache first, then Gemini, then falls back to static content.
 * @param countryCode - ISO country code
 * @param countryName - Human-readable country name
 * @param knowledgeLevel - User's assessed knowledge level
 * @param focusAreas - Topics to emphasize
 * @param userConfusion - The user's stated area of confusion
 * @param sessionId - Session identifier for rate limiting
 * @param recommendedStepCount - Optional override for number of steps
 * @returns Array of election steps and their source
 */
export async function generatePersonalizedGuide(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
  sessionId?: string,
  recommendedStepCount?: number,
): Promise<{ steps: ElectionStep[]; source: 'gemini' | 'cache' | 'fallback' }> {
  return withTrace(
    'gemini_generate_guide',
    { countryCode, knowledgeLevel },
    async () => {
      try {
        await authReady;
        const cached = await getCachedGuide(countryCode, knowledgeLevel);
        if (cached && cached.length >= 5) {
          return { steps: cached, source: 'cache' };
        }
        if (cached) {
          logger.warn('Ignoring shallow cache', { countryCode, count: String(cached.length) });
        }
      } catch (error) {
        console.warn('[Gemini] Cache read failed:', error);
      }

      const limit = await checkRateLimit(sessionId ?? 'guide', 'gemini');
      if (!limit.allowed) {
        return { steps: getFallbackGuide(countryCode, knowledgeLevel) ?? [], source: 'fallback' };
      }

      const prompt = buildPersonalizedGuidePrompt(
        countryCode, countryName, knowledgeLevel, focusAreas, userConfusion,
        recommendedStepCount,
      );
      const raw = await callGemini(prompt, sessionId ?? 'guide', false, undefined, MAX_TOKENS_LONG);
      if (raw) {
        const steps = parseGeminiJSON(raw, isElectionStepsArray, []);
        if (steps.length >= 5) {
          try { await cacheElectionGuide(countryCode, knowledgeLevel, steps); } catch (error) {
            console.warn('[Gemini] Cache write failed:', error);
          }
          return { steps, source: 'gemini' };
        }
        logger.warn('Gemini returned insufficient steps', {
          countryCode,
          stepCount: String(steps.length)
        });
      }

      return { steps: getFallbackGuide(countryCode, knowledgeLevel) ?? [], source: 'fallback' };
    }
  );
}
