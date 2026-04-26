/**
 * All Gemini prompt builders.
 * Prompts are depth-stratified by knowledge level and include
 * the user's stated confusion as a mandatory focus area.
 */

import type {
  AssessmentAnswer,
  ChatMessage,
  ElectionStep,
  KnowledgeLevel,
  QuizQuestion,
  QuizResult,
  UserContext,
} from '@/types';

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

/**
 * Builds a comprehensive, depth-stratified prompt for the election guide.
 * userConfusion is passed directly so Gemini addresses it within the content.
 */
export function buildPersonalizedGuidePrompt(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
): string {
  const stepCount = knowledgeLevel === 'beginner' ? 6 : knowledgeLevel === 'intermediate' ? 8 : 10;

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
  "simpleExplanation": "1 sentence in plain English with an analogy",
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

/**
 * Builds a depth-matched micro-quiz prompt for a specific step.
 */
export function buildMicroQuizPrompt(
  step: ElectionStep,
  knowledgeLevel: KnowledgeLevel,
): string {
  const questionSpec = knowledgeLevel === 'advanced'
    ? 'Create a HARD question testing a legal nuance, edge case, or specific statutory detail from this step. The wrong options should be plausible near-misses.'
    : knowledgeLevel === 'intermediate'
    ? 'Create a MEDIUM question testing understanding of the process, a specific deadline, or a procedural detail. Wrong options should test common misconceptions.'
    : 'Create an EASY question testing basic recall of the most important fact in this step. Wrong options should be clearly wrong but not absurd.';

  return `Generate ONE quiz question about this election step.
Step title: "${step.title}"
Step content: "${step.detailedExplanation || step.description}"
Knowledge level: ${knowledgeLevel}
${questionSpec}
Respond ONLY with JSON: {"question":"...","options":["A","B","C","D"],"correctIndex":0,"hint":"..."}`;
}

/**
 * Builds re-explanation prompt after wrong answer.
 */
export function buildReExplanationPrompt(
  step: ElectionStep,
  userAnswer: string,
  correctAnswer: string,
  knowledgeLevel: KnowledgeLevel,
): string {
  const approach = knowledgeLevel === 'beginner'
    ? 'Use a simple real-world analogy. Avoid jargon.'
    : knowledgeLevel === 'intermediate'
    ? 'Clarify exactly why the chosen answer is wrong and what makes the correct answer right. Be specific about the procedure or rule.'
    : 'Provide deeper technical and legal context. Reference the specific law, article, or procedural rule that makes the correct answer right.';
  return `Correct answer re-explanation for a ${knowledgeLevel} learner.
Step: "${step.title}"
Wrong: "${userAnswer}"
Right: "${correctAnswer}"
Task: Explain why "${userAnswer}" is wrong and why "${correctAnswer}" is right. 
${approach}
MAX 2 SENTENCES. BE FAST.`;
}

/**
 * Builds the final quiz prompt. Questions must reference specific facts from steps.
 */
export function buildPersonalizedQuizPrompt(
  completedSteps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
): string {
  const stepDetails = completedSteps.map((s) =>
    `Step: ${s.title}\nContent: ${s.detailedExplanation || s.description}`
  ).join('\n\n');

  const difficultySpec = knowledgeLevel === 'advanced'
    ? '10 COMPLEX, SCENARIO-BASED questions testing legal application, edge cases, and specific statutory details. Do NOT repeat micro-quiz questions.'
    : knowledgeLevel === 'intermediate'
    ? '10 APPLICATION-BASED questions testing process flow, deadlines, and procedural scenarios.'
    : '10 COMPREHENSION questions testing overall process understanding and key facts.';

  return `Generate ${difficultySpec} for a certification quiz in ${countryCode}.

CRITICAL: Each question MUST reference a specific fact, name, number, or detail from the step content below. Do NOT generate generic questions.

Steps studied:
${stepDetails}

Each question object: {"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","difficulty":"easy|medium|hard","relatedStepId":"..."}
CRITICAL: Use realistic scenarios (e.g., "If a voter is at the booth and X happens...") to test actual application of knowledge.
MANDATORY: Every question MUST be unique. Do NOT repeat the same concept, fact, or micro-quiz question.
Respond ONLY with a JSON array of 10 unique question objects. No markdown.`;
}

/**
 * Builds the AI assistant system prompt with full user context.
 */
export function buildAssistantSystemPrompt(
  userContext: UserContext,
  completedSteps: ElectionStep[],
  messageCount: number,
): string {
  const steps = completedSteps.map((s) => s.title).join(', ');
  const depthNote = userContext.knowledgeLevel === 'advanced'
    ? 'Provide technically precise, legally accurate answers with specific references to laws, articles, and official procedures.'
    : userContext.knowledgeLevel === 'intermediate'
    ? 'Provide clear, detailed answers covering the full process with specific steps and official guidance.'
    : 'Explain concepts simply using analogies. Avoid jargon. Be encouraging and clear.';

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `You are BallotIQ, a helpful teacher and non-partisan election expert for ${userContext.countryName}. 
Your goal is to guide the user with warm, professional, and concise information that is balanced in length—neither too short nor too overwhelming.

Current Date: ${currentDate}

User Profile:
- Country: ${userContext.countryName} (${userContext.countryCode})
- Knowledge Level: ${userContext.knowledgeLevel}
- Voted Before: ${userContext.hasVotedBefore ? 'Yes' : 'No (first-time voter)'}
- Main Confusion: "${userContext.mainConfusion}"
- Topics Completed: ${steps || 'Just started'}
- Simplified Mode: ${userContext.adaptationActive ? 'Yes — use extra simple language' : 'No'}

Response Guidelines:
1. ONLY answer questions about ${userContext.countryName} elections. If asked about another country, politely redirect.
2. ${depthNote}
3. If you don't know a specific current detail, say so and direct the user to the official election body website.
4. Directly address the user's stated confusion ("${userContext.mainConfusion}") if it's relevant to their question.
5. Formatting & Tone:
   - Use a "helpful teacher" tone: encouraging, clear, and focused.
   - DO NOT use markdown symbols like asterisks (*), hashes (#), or bullet markers.
   - Use clean, plain text with simple paragraph breaks.
   - Aim for 2-4 short, punchy paragraphs (approx 150-200 words).
   - Ensure your response is COMPLETE and does not end abruptly.
7. Conversational Flow:
   - ${messageCount === 0 ? 'Greet the user warmly as this is the start of the conversation.' : 'DO NOT say "Hello", "Hi", or greet the user as this is a continuing conversation. Get straight to the point.'}
   - DO NOT use repetitive clichés like "That's a very insightful question", "Great question", or "I'd be happy to help".
   - Start your response directly with the information requested.
8. Never express political opinions or favor any party, candidate, or ideology.`;
}

/**
 * Builds prompt for post-quiz performance insight.
 */
export function buildPerformanceInsightPrompt(
  results: QuizResult[],
  questions: QuizQuestion[],
  knowledgeLevel: KnowledgeLevel,
): string {
  const wrong = results
    .filter((r) => !r.isCorrect)
    .map((r) => questions.find((q) => q.id === r.questionId)?.question)
    .filter(Boolean)
    .join('; ');
  const score = results.filter((r) => r.isCorrect).length;
  return `A ${knowledgeLevel} learner scored ${score}/${results.length} on their election knowledge quiz.
${wrong ? `Questions missed: ${wrong}` : 'They got a perfect score!'}
Write a warm, specific, encouraging performance message under 100 words. Plain text only.`;
}

/**
 * Builds the user message for assistant chat with recent context.
 */
export function buildAssistantUserMessage(
  question: string,
  chatHistory: ChatMessage[],
): string {
  const recent = chatHistory.slice(-6).map((m) => `${m.role}: ${m.content}`).join('\n');
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `${recent ? `Recent conversation:\n${recent}\n\n` : ''}---
CURRENT REAL-TIME DATE: ${currentDate}
TIME: ${new Date().toLocaleTimeString()}
---
USER QUESTION: ${question}

MANDATORY: Provide a COMPLETE and DETAILED response. Do NOT cut off. Ensure you are answering based on the year 2026.`;
}
