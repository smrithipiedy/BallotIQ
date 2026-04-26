/**
 * Hybrid assistant router.
 * Routes queries between Gemini (dynamic AI) and FAQ engine (deterministic fallback).
 */

import { detectIntent } from './intentEngine';
import { getFAQResponse } from './faqDatabase';
import { askAssistant } from '@/lib/gemini/operations';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { logger } from '@/lib/logger';

/**
 * Gets the best response for the user, prioritizing Gemini but falling back to FAQ.
 */
export async function getAssistantResponse(
  question: string,
  userContext: UserContext,
  completedSteps: ElectionStep[],
  chatHistory: ChatMessage[]
): Promise<string> {
  // 1. Try Gemini first (the "smart" path)
  try {
    const aiResponse = await askAssistant(question, userContext, completedSteps, chatHistory);
    const isError = !aiResponse || 
                    aiResponse.includes('temporarily unavailable') || 
                    aiResponse.includes('trouble connecting') ||
                    aiResponse.includes('currently offline');
                    
    if (aiResponse && !isError) {
      return aiResponse;
    }
  } catch (error) {
    logger.warn('Gemini assistant failed, falling back to FAQ', { error });
  }

  // 2. Fallback to FAQ engine (the "reliable" path)
  const intent = detectIntent(question);
  const faq = getFAQResponse(intent, userContext.countryCode, userContext.knowledgeLevel);

  if (faq) {
    return `${faq.answer}\n\n(Source: ${faq.source} - ${faq.sourceUrl})`;
  }

  // 3. Last resort generic answer
  return "I'm sorry, I couldn't find a specific answer to that. Please consult your local election authority for the most accurate information.";
}
