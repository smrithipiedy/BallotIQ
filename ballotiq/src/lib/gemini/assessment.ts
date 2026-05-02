/**
 * Gemini assessment analysis logic.
 */

import type { AssessmentAnswer, KnowledgeLevel } from '@/types';
import { buildAssessmentAnalysisPrompt } from './prompts';
import { parseGeminiJSON, isAssessmentResult } from './validator';
import { callGemini } from './core';
import { sanitizeUserInput } from '@/lib/security/sanitize';

/**
 * Analyzes assessment answers to determine knowledge level.
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
    focusAreas: [sanitizeUserInput(answers.mainConfusion || 'general election process')],
  };

  const sanitizedConfusion = sanitizeUserInput(answers.mainConfusion);
  const sanitizedAnswers = { ...answers, mainConfusion: sanitizedConfusion };

  const prompt = buildAssessmentAnalysisPrompt(sanitizedAnswers, countryCode, countryName);
  const raw = await callGemini(prompt, 'assessment', true, undefined, 1024);
  if (!raw) return fallback;
  return parseGeminiJSON(raw, isAssessmentResult, fallback);
}
