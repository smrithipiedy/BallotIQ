/**
 * Gemini AI assistant and concept re-explanation logic.
 */

import type { ChatMessage, ElectionStep, KnowledgeLevel, UserContext } from '@/types';
import { buildAssistantSystemPrompt, buildAssistantUserMessage, buildReExplanationPrompt } from './prompts';
import { sanitizeAIResponse } from '@/lib/security/sanitize';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { withTrace } from '@/lib/firebase/performance';
import { logger } from '@/lib/logger';
import { callGemini, isGeminiEnabled } from './core';
import { sanitizeUserInput } from '@/lib/security/sanitize';

/**
 * Conversational assistant with full user context.
 */
export async function askAssistant(
  question: string,
  userContext: UserContext,
  completedSteps: ElectionStep[],
  chatHistory: ChatMessage[],
): Promise<string> {
  return withTrace(
    'gemini_assistant_response',
    { countryCode: userContext.countryCode },
    async () => {
      if (!isGeminiEnabled) {
        return 'The AI assistant is offline. Check your API key configuration.';
      }

      const limit = await checkRateLimit(userContext.sessionId, 'gemini');
      if (!limit.allowed) {
        return 'You\'ve reached the daily AI request limit. Try again tomorrow.';
      }

      const systemPrompt = buildAssistantSystemPrompt(userContext, completedSteps, chatHistory.length);
      const sanitizedQuestion = sanitizeUserInput(question);
      const userMessage = buildAssistantUserMessage(sanitizedQuestion, chatHistory);

      try {
        const raw = await callGemini(userMessage, userContext.sessionId, true, systemPrompt, 1024);
        if (raw) return sanitizeAIResponse(raw);
        return 'The AI assistant is temporarily unavailable. Please try your question again in a moment or check your connection.';
      } catch (err: unknown) {
        logger.error('Assistant API call failed', err as Error, { component: 'GeminiClient', sessionId: userContext.sessionId });
        throw err;
      }
    }
  );
}

/**
 * Re-explains a concept when user gets micro-quiz wrong.
 */
export async function reExplainConcept(
  step: ElectionStep,
  userAnswer: string,
  correctAnswer: string,
  knowledgeLevel: KnowledgeLevel,
  sessionId?: string,
): Promise<string> {
  const fallback = `The correct answer is "${correctAnswer}". ${step.simpleExplanation}`;
  const prompt = buildReExplanationPrompt(step, userAnswer, correctAnswer, knowledgeLevel);
  const raw = await callGemini(prompt, sessionId ?? 'explain', true);
  if (!raw) return fallback;
  return sanitizeAIResponse(raw);
}
