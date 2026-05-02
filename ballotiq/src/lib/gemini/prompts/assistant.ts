import type { ChatMessage, ElectionStep, KnowledgeLevel, UserContext } from '@/types';

/**
 * Builds the AI assistant system prompt with full user context.
 */
export function buildAssistantSystemPrompt(
  userContext: UserContext,
  completedSteps: ElectionStep[],
  messageCount: number,
): string {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const depthNote = userContext.knowledgeLevel === 'advanced'
    ? 'Be precise. Reference specific laws, articles, or procedures by name when relevant.'
    : userContext.knowledgeLevel === 'intermediate'
    ? 'Be clear and specific. Name the key steps, deadlines, and official bodies involved.'
    : 'Keep it simple. Use everyday language. One short analogy can help if needed.';

  const greeting = messageCount === 0
    ? `Start with a single warm, natural sentence greeting them as a ${userContext.knowledgeLevel}-level learner in ${userContext.countryName}. Then answer.`
    : 'Do NOT greet. Get straight to the answer.';

  return `You are BallotIQ, a friendly non-partisan election guide for ${userContext.countryName}.
Current Date: ${currentDate}.

CONTEXT: User is ${userContext.knowledgeLevel} level in ${userContext.countryName}. Initial concern: "${userContext.mainConfusion}".

RULES (strictly follow):
1. Answer the CURRENT QUESTION completely in full, professional sentences. 
2. ${depthNote}
3. ${greeting}
4. Plain text only — NO bold (**), NO headings (#). Simple numbered or bullet lists are okay.
5. Be direct and relevant. Do not talk about the "Initial concern" unless the current question is related to it.
6. If unsure, say so and point to the official election body.
7. Stay on ${userContext.countryName} elections only.
8. Never express political opinions. Always be non-partisan.
9. If the user asks an unrelated topic (not elections/voting/civic politics), politely refuse in 1-2 lines and explain what they can ask instead.
10. CRITICAL: simpleExplanation must never be a single sentence. If your simpleExplanation is shorter than 3 sentences, rewrite it.
11. Be proactive. If the user has completed some steps, reference them naturally. Suggest what they should focus on next based on their progress. If they seem confused, offer to explain the current step differently. Don't just answer questions — anticipate what the user needs to know next.`;
}

/**
 * Builds the user message for assistant chat with recent context.
 */
export function buildAssistantUserMessage(
  question: string,
  chatHistory: ChatMessage[],
): string {
  const historyArr = Array.isArray(chatHistory) ? chatHistory : [];
  const recent = historyArr.slice(-4).map((m) => `${m.role}: ${m.content}`).join('\n');
  
  return `${recent ? `Recent conversation:\n${recent}\n\n` : ''}USER QUESTION: ${question}

Remember: answer in 150-250 words, plain text, no markdown. Always complete your final sentence — never cut off mid-thought.`;
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
  
  const safeUserAnswer = !userAnswer || userAnswer.trim() === '' ? 'an incorrect option' : userAnswer;

  return `Correct answer re-explanation for a ${knowledgeLevel} learner.
Step: "${step.title}"
The user selected "${safeUserAnswer}" which is incorrect. The correct answer is "${correctAnswer}".
Task: Explain why "${safeUserAnswer}" is wrong and why "${correctAnswer}" is right. 
${approach}
MAX 2 SENTENCES. BE FAST.`;
}
