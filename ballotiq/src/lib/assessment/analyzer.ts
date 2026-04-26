/**
 * Local assessment analyzer.
 * Derives knowledge level and path configuration without requiring AI.
 * Used as a fast fallback and audit-compliant diagnostic.
 */

import type { AssessmentAnswer, KnowledgeLevel } from '@/types';

interface AssessmentResult {
  knowledgeLevel: KnowledgeLevel;
  recommendedStepCount: number;
  focusAreas: string[];
}

/**
 * Analyzes assessment answers locally.
 * Matches audit requirement: beginner=7 steps, advanced=3 steps.
 */
export function analyzeAssessmentLocally(
  answers: AssessmentAnswer
): AssessmentResult {
  const rating = answers.selfRatedKnowledge;
  const voted = answers.hasVotedBefore;

  let knowledgeLevel: KnowledgeLevel = 'beginner';
  let recommendedStepCount = 7;

  if (rating >= 4 && voted) {
    knowledgeLevel = 'advanced';
    recommendedStepCount = 3;
  } else if (rating >= 3 || voted) {
    knowledgeLevel = 'intermediate';
    recommendedStepCount = 5;
  }

  return {
    knowledgeLevel,
    recommendedStepCount,
    focusAreas: [answers.mainConfusion || 'General election process']
  };
}
