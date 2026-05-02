import type { KnowledgeLevel } from '@/types';

/**
 * Builds a comprehensive, depth-stratified prompt for the election guide.
 */
export function buildPersonalizedGuidePrompt(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
  stepCountParam?: number,
): string {
  const stepCount = stepCountParam ?? (knowledgeLevel === 'beginner' ? 6 : knowledgeLevel === 'intermediate' ? 8 : 10);

  const depthSpec = knowledgeLevel === 'advanced'
    ? `ADVANCED DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 8-10 sentences minimum. Cover the legal framework (cite specific laws, articles, or acts by name), constitutional basis, historical context, edge cases, procedural technicalities, exceptions to the rule, and relevant court judgments or reforms.
- Include specific numeric thresholds, deadlines, and statutory references (e.g., "Under Section 62 of RPA 1951..." or "Article 324 grants...").
- requirements: 5-7 items covering official documents, eligibility conditions, and legal prerequisites.
- tips: 5-7 items covering practical strategies, common pitfalls, official resources with URLs, and professional advice.`
    : knowledgeLevel === 'intermediate'
    ? `INTERMEDIATE DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 6-8 sentences minimum. Cover the full process flow with specific steps, real deadlines, actual form names/numbers, nuanced differences (e.g., state vs federal, postal vs in-person), and what happens if steps are missed.
- Include specific timelines ("registration must be completed 30 days before election day"), official body names, and practical examples.
- requirements: 4-5 items listing specific documents with names and alternatives.
- tips: 4-5 items with actionable advice including official website URLs.`
    : `BEGINNER DEPTH REQUIREMENTS (strictly enforced):
- detailedExplanation: 4-6 sentences minimum. Use clear, jargon-free language. Include one real-world analogy to make the concept concrete. Explain WHY this step matters to the voter.
- simpleExplanation: A simplified version of the concept written in plain, everyday language. Must be 4-6 sentences minimum. Do NOT shorten the explanation — make it EASIER to understand, not shorter. Use simple words, relatable comparisons, and break complex ideas into small steps. A 10-year-old should be able to follow this.
- requirements: 3-4 items written in plain English (e.g., "A government-issued photo ID like your passport or driver's license").
- tips: 3-4 practical tips written as friendly advice (e.g., "Register at least 2 weeks before the deadline to avoid last-minute issues").`;

  return `You are an authoritative, non-partisan civic education expert for ${countryName} (${countryCode}).

CRITICAL RULES:
1. ALL information MUST be specific to ${countryName}. Do NOT use US election information unless countryCode is "US".
2. Use current, accurate information for ${countryName} as of April 2026.
3. The user has specifically stated they are confused about: "${userConfusion}". 
   You MUST address this confusion explicitly within the relevant step(s). If this topic doesn't have its own step, incorporate a direct clarification in the most relevant step's detailedExplanation.

${depthSpec}

Generate exactly ${stepCount} election learning steps covering the full electoral process of ${countryName}.
MANDATORY: You MUST provide at least 5 steps for every request, regardless of the user's knowledge level. If the electoral process is simple, break it down into detailed procedural sub-steps to meet this minimum.
Focus areas to emphasize: ${focusAreas.join(', ')}.

Each step MUST be a JSON object with ALL of these fields:
{
  "id": "unique_string",
  "order": <number>,
  "title": "clear step title",
  "description": "1-2 sentence summary",
  "detailedExplanation": "<MEETS DEPTH REQUIREMENTS ABOVE>",
  "simpleExplanation": "<MEETS BEGINNER DEPTH REQUIREMENTS ABOVE — MUST BE 4-6 SENTENCES MINIMUM>",
  "timeline": "when this happens (e.g., '30 days before election')",
  "requirements": ["item1", "item2", ...],
  "tips": ["tip1", "tip2", ...],
  "status": "locked",
  "microQuizQuestion": {
    "question": "<specific question testing a fact from detailedExplanation>",
    "options": ["<4 plausible options, only one correct>"],
    "correctIndex": <0-3>,
    "hint": "<points to the specific part of the explanation>"
  }
}

Respond ONLY with a valid JSON array of these step objects. No markdown. No preamble. No postamble. 
MANDATORY: Ensure the JSON is complete and valid. Do NOT truncate.`;
}
