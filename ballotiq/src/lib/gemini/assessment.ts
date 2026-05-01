/**
 * Assessment analysis via Gemini AI.
 * Determines knowledge level from user's self-assessment answers.
 */

import type { AssessmentAnswer, KnowledgeLevel } from '@/types';
import { buildAssessmentAnalysisPrompt } from './prompts';
import { MAX_TOKENS_MEDIUM } from '@/lib/constants/ai';
import { parseGeminiJSON, isAssessmentResult } from './validator';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { callGemini } from './client';

/**
 * Analyzes assessment answers to determine the user's knowledge level.
 * Falls back to a heuristic based on self-rated knowledge if Gemini is unavailable.
 * @param answers - The user's self-assessment answers
 * @param countryCode - ISO country code
 * @param countryName - Human-readable country name
 * @returns Knowledge level, recommended step count, and focus areas
 */
export async function analyzeAssessment(
  answers: AssessmentAnswer,
  countryCode: string,
  countryName: string,
): Promise<{ knowledgeLevel: KnowledgeLevel; recommendedStepCount: number; focusAreas: string[] }> {
  const fallback = {
    knowledgeLevel: (
      answers.selfRatedKnowledge <= 2 ? 'beginner' :
        answers.selfRatedKnowledge <= 4 ? 'intermediate' : 'advanced'
    ) as KnowledgeLevel,
    recommendedStepCount: answers.selfRatedKnowledge <= 2 ? 6 : answers.selfRatedKnowledge <= 4 ? 8 : 10,
    focusAreas: [answers.mainConfusion || 'general election process'],
  };

  const prompt = buildAssessmentAnalysisPrompt(answers, countryCode, countryName);

  const limit = await checkRateLimit('assessment', 'gemini');
  if (!limit.allowed) return fallback;

  const raw = await callGemini(prompt, 'assessment', true, undefined, MAX_TOKENS_MEDIUM);
  if (!raw) return fallback;
  return parseGeminiJSON(raw, isAssessmentResult, fallback);
}
