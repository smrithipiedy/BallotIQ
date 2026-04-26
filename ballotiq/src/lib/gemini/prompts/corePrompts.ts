/**
 * Core structural Gemini prompts for BallotIQ.
 * Manages assessment analysis and long-form guide generation.
 */

import type { AssessmentAnswer, KnowledgeLevel } from '@/types';

/** Builds prompt for analyzing assessment answers */
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

/** Builds prompt for the personalized election guide */
export function buildPersonalizedGuidePrompt(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
): string {
  const stepCount = knowledgeLevel === 'beginner' ? 7 : knowledgeLevel === 'intermediate' ? 5 : 3;

  const depthSpec = knowledgeLevel === 'advanced'
    ? `ADVANCED DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 8-10 sentences minimum. Cover the legal framework (cite specific laws, articles, or acts by name), constitutional basis, historical context, procedural technicalities, and relevant court judgments.
- Include specific numeric thresholds, deadlines, and statutory references.
- requirements: 5-7 items covering official documents and legal prerequisites.
- tips: 5-7 items covering practical strategies and official resources.`
    : knowledgeLevel === 'intermediate'
    ? `INTERMEDIATE DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 6-8 sentences minimum. Cover the full process flow with specific steps, real deadlines, actual form names/numbers, and nuanced differences.
- Include specific timelines, official body names, and practical examples.
- requirements: 4-5 items listing specific documents with names and alternatives.
- tips: 4-5 items with actionable advice including official website URLs.`
    : `BEGINNER DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 4-6 sentences minimum. Use clear, jargon-free language. Include one real-world analogy. Explain WHY this step matters.
- requirements: 3-4 items written in plain English.
- tips: 3-4 practical tips written as friendly advice.`;

  return `You are an authoritative civic expert for ${countryName} (${countryCode}).
Confusion to address: "${userConfusion}". 
${depthSpec}

Generate exactly ${stepCount} steps (MANDATORY: minimum 5 steps if beginner).
Focus: ${focusAreas.join(', ')}.

Respond ONLY with a JSON array:
[{
  "id": "...", "order": 1, "title": "...", "description": "...",
  "detailedExplanation": "...", "simpleExplanation": "...",
  "timeline": "...", "requirements": [], "tips": [], "status": "locked",
  "microQuizQuestion": { "question": "...", "options": [], "correctIndex": 0, "hint": "..." }
}]`;
}
