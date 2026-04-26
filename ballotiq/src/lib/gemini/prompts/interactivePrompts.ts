/**
 * Interactive Gemini prompts for BallotIQ.
 * Manages quizzes, re-explanations, and assistant conversations.
 */

import type {
  ChatMessage,
  ElectionStep,
  KnowledgeLevel,
  QuizQuestion,
  QuizResult,
  UserContext,
} from '@/types';

/** Builds a micro-quiz prompt for a specific step */
export function buildMicroQuizPrompt(step: ElectionStep, knowledgeLevel: KnowledgeLevel): string {
  return `Generate ONE ${knowledgeLevel} level quiz question about "${step.title}".
Content: "${step.detailedExplanation}"
Respond ONLY with JSON: {"question":"...","options":["A","B","C","D"],"correctIndex":0,"hint":"..."}`;
}

/** Builds re-explanation prompt after wrong answer */
export function buildReExplanationPrompt(
  step: ElectionStep,
  userAnswer: string,
  correctAnswer: string,
  knowledgeLevel: KnowledgeLevel,
): string {
  return `Explain why "${userAnswer}" is wrong and "${correctAnswer}" is right for a ${knowledgeLevel} learner.
Step: "${step.title}"
MAX 2 SENTENCES.`;
}

export function buildPersonalizedQuizPrompt(
  completedSteps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
): string {
  const stepDetails = completedSteps.map((s) =>
    `Step: ${s.title}\nContent: ${s.detailedExplanation || s.description}`
  ).join('\n\n');

  const difficultySpec = knowledgeLevel === 'advanced'
    ? '10 COMPLEX, SCENARIO-BASED questions testing legal application, edge cases, and specific statutory details.'
    : knowledgeLevel === 'intermediate'
    ? '10 APPLICATION-BASED questions testing process flow, deadlines, and procedural scenarios.'
    : '10 COMPREHENSION questions testing overall process understanding and key facts.';

  return `Generate ${difficultySpec} for a certification quiz in ${countryCode}.
  
CRITICAL: Each question MUST reference a specific fact, name, number, or detail from the step content below. 

Steps studied:
${stepDetails}

Format: {"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","difficulty":"easy|medium|hard","relatedStepId":"..."}
MANDATORY: Every question MUST be unique. Do NOT repeat the same concept or fact.
Respond ONLY with a JSON array of 10 unique question objects.`;
}

export function buildAssistantSystemPrompt(
  userContext: UserContext,
  completedSteps: ElectionStep[],
): string {
  const steps = completedSteps.map((s) => s.title).join(', ');
  const depthNote = userContext.knowledgeLevel === 'advanced'
    ? 'Provide technically precise, legally accurate answers with specific references to laws, articles, and official procedures.'
    : userContext.knowledgeLevel === 'intermediate'
    ? 'Provide clear, detailed answers covering the full process with specific steps and official guidance.'
    : 'Explain concepts simply using analogies. Avoid jargon. Be encouraging and clear.';

  return `You are BallotIQ, a trusted, non-partisan election education assistant for ${userContext.countryName}.

User Profile:
- Country: ${userContext.countryName} (${userContext.countryCode})
- Knowledge Level: ${userContext.knowledgeLevel}
- Voted Before: ${userContext.hasVotedBefore ? 'Yes' : 'No'}
- Main Confusion: "${userContext.mainConfusion}"
- Topics Completed: ${steps || 'Just started'}
- Simplified Mode: ${userContext.adaptationActive ? 'Yes' : 'No'}

Response Guidelines:
1. ONLY answer questions about ${userContext.countryName} elections.
2. ${depthNote}
3. If you don't know a detail, direct the user to the official election body website.
4. Directly address "${userContext.mainConfusion}" if relevant.
5. MANDATORY: Reply in "${userContext.language}" language.
6. BE EXTREMELY CONCISE. Max 150 words. Never express political opinions.`;
}

/** Builds prompt for post-quiz performance insight */
export function buildPerformanceInsightPrompt(results: QuizResult[], questions: QuizQuestion[], knowledgeLevel: KnowledgeLevel): string {
  const score = results.filter(r => r.isCorrect).length;
  return `A ${knowledgeLevel} learner scored ${score}/${results.length}. Write a warm, 50-word performance message.`;
}

/** Builds the user message for assistant chat */
export function buildAssistantUserMessage(question: string, chatHistory: ChatMessage[]): string {
  const recent = chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
  return `${recent}\nUser: ${question}`;
}
