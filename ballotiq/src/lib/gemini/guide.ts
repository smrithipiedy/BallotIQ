/**
 * Gemini election guide generation logic.
 */

import type { ElectionStep, KnowledgeLevel } from '@/types';
import { buildPersonalizedGuidePrompt } from './prompts';
import { parseGeminiJSON, isElectionStepsArray } from './validator';
import { getFallbackGuide } from './fallback';
import { getCachedGuide, cacheElectionGuide } from '@/lib/firebase/firestore';
import { authReady } from '@/lib/firebase/client';
import { withTrace } from '@/lib/firebase/performance';
import { logger } from '@/lib/logger';
import { callGemini } from './core';
import { sanitizeUserInput } from '@/lib/security/sanitize';

/**
 * Generates election steps personalized to user's knowledge level.
 */
export async function generatePersonalizedGuide(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
  sessionId?: string,
  stepCount?: number,
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
      } catch { /* ignore cache errors */ }

      const sanitizedConfusion = sanitizeUserInput(userConfusion);
      const sanitizedFocusAreas = focusAreas.map(sanitizeUserInput);

      const prompt = buildPersonalizedGuidePrompt(
        countryCode, countryName, knowledgeLevel, sanitizedFocusAreas, sanitizedConfusion, stepCount
      );
      const raw = await callGemini(prompt, sessionId ?? 'guide', false, undefined, 2048);
      if (raw) {
        const steps = parseGeminiJSON(raw, isElectionStepsArray, []);
        if (steps.length >= 5) {
          try { await cacheElectionGuide(countryCode, knowledgeLevel, steps); } catch { /* ignore */ }
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
