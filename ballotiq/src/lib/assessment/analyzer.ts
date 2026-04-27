/**
 * Logic for analyzing diagnostic assessment answers locally.
 * Provides instant results and serves as a robust fallback for Gemini.
 */

import type { AssessmentAnswer, KnowledgeLevel } from '@/types';

/**
 * Derives knowledge level and path configuration from assessment answers.
 * Implements the core personalization logic of BallotIQ.
 */
export function analyzeAssessmentLocally(answers: AssessmentAnswer): {
  knowledgeLevel: KnowledgeLevel;
  recommendedStepCount: number;
  focusAreas: string[];
} {
  let score = 0;

  // Question 1: Experience (Weight: 2)
  if (answers.hasVotedBefore) score += 2;

  // Question 2: Self-rated knowledge (Weight: 1-5)
  score += answers.selfRatedKnowledge;

  // Knowledge Level Derivation
  // Max score: 7 (2 + 5), Min: 1 (0 + 1)
  let level: KnowledgeLevel = 'beginner';
  let stepCount = 7;

  if (score >= 6) {
    level = 'advanced';
    stepCount = 3; // Advanced users get a concise, high-depth path
  } else if (score >= 4) {
    level = 'intermediate';
    stepCount = 5; // Intermediate users get a balanced path
  }

  // Extract focus areas from confusion text
  const confusion = (answers.mainConfusion || '').toLowerCase();
  const focusAreas: string[] = [];

  if (confusion.includes('register') || confusion.includes('sign up')) focusAreas.push('voter registration');
  if (confusion.includes('evm') || confusion.includes('machine') || confusion.includes('button')) focusAreas.push('voting technology');
  if (confusion.includes('id') || confusion.includes('document') || confusion.includes('proof')) focusAreas.push('identification requirements');
  if (confusion.includes('count') || confusion.includes('result') || confusion.includes('winner')) focusAreas.push('counting and results');
  if (confusion.includes('timeline') || confusion.includes('date') || confusion.includes('when')) focusAreas.push('election timelines');

  // Default focus area if none detected
  if (focusAreas.length === 0) {
    focusAreas.push('general election process');
  }

  return {
    knowledgeLevel: level,
    recommendedStepCount: stepCount,
    focusAreas: focusAreas.slice(0, 3),
  };
}
