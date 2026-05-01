/**
 * AI Assistant and re-explanation via Gemini.
 * Handles conversational Q&A and concept reinforcement.
 */

import type { ChatMessage, ElectionStep, KnowledgeLevel, UserContext } from '@/types';
import { buildAssistantSystemPrompt, buildAssistantUserMessage, buildReExplanationPrompt } from './prompts';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { sanitizeAIResponse } from '@/lib/security/sanitize';
import { withTrace } from '@/lib/firebase/performance';
import { callGemini } from './client';

/**
 * Conversational assistant with full user context.
 * Rate-limited and traced for performance monitoring.
 * @param question - The user's question text
 * @param userContext - Full user context for personalization
 * @param completedSteps - Steps the user has completed
 * @param chatHistory - Previous chat messages for context
 * @returns AI-generated response string
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
      const limit = await checkRateLimit(userContext.sessionId, 'gemini');
      if (!limit.allowed) {
        return 'Daily AI request limit reached. Please try again tomorrow.';
      }

      const systemPrompt = buildAssistantSystemPrompt(userContext, completedSteps, chatHistory.length);
      const userMessage = buildAssistantUserMessage(question, chatHistory);

      const raw = await callGemini(userMessage, userContext.sessionId, false, systemPrompt, 2048);

      if (raw) return sanitizeAIResponse(raw);

      return 'The AI service is currently at capacity. Please try again in a moment, or browse the offline guide below.';
    }
  );
}

/**
 * Re-explains a concept when the user gets a micro-quiz question wrong.
 * Uses simplified language tailored to the user's knowledge level.
 * @param step - The election step being re-explained
 * @param userAnswer - What the user answered
 * @param correctAnswer - The correct answer text
 * @param knowledgeLevel - User's knowledge level
 * @param sessionId - Session identifier for rate limiting
 * @returns Simplified re-explanation string
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

  const limit = await checkRateLimit(sessionId ?? 'explain', 'gemini');
  if (!limit.allowed) return fallback;

  const raw = await callGemini(prompt, sessionId ?? 'explain', true);
  if (!raw) return fallback;
  return sanitizeAIResponse(raw);
}
