import type { AssessmentAnswer } from '@/types';

/**
 * Builds prompt for analyzing assessment answers.
 */
export function buildAssessmentAnalysisPrompt(
  answers: AssessmentAnswer,
  countryCode: string,
  countryName: string,
): string {
  return `You are a civic education expert specializing in ${countryName} (${countryCode}).
Analyze this user's self-assessment:
- Has voted before: ${answers.hasVotedBefore ? 'Yes' : 'No'}
- Self-rated knowledge (1-5): ${answers.selfRatedKnowledge}
- Their main confusion: "${answers.mainConfusion}"

Based on this, determine the appropriate learning level and relevant focus areas.
Respond ONLY with this exact JSON (no markdown, no extra text):
{"knowledgeLevel":"beginner|intermediate|advanced","recommendedStepCount":<6-10>,"focusAreas":["area1","area2","area3"]}`;
}
