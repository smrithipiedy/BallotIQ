/**
 * Hybrid Assistant Engine.
 * Routes user queries between the static FAQ engine (fast, zero cost, reliable)
 * and the Gemini AI (smart, conversational, depth-aware).
 */

import { detectIntent } from './intentEngine';
import { getFAQResponse } from './faqDatabase';
import { askAssistant } from '@/lib/gemini/client';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { logger } from '@/lib/logger';
import { getCountryByCode } from '@/lib/constants/countries';

interface AssistantResponse {
  content: string;
  source: 'ai' | 'faq' | 'fallback' | 'error';
  officialSource?: { name: string; url: string };
  suggestedQuestions?: string[];
}

/**
 * Orchestrates the best response for the user based on context and intent.
 * This is the main entry point for the assistant UI.
 */
export async function getAssistantResponse(
  question: string,
  userContext: UserContext,
  completedSteps: ElectionStep[],
  chatHistory: ChatMessage[],
  aiEnabled: boolean = true
): Promise<AssistantResponse> {
  const intent = detectIntent(question);
  const countryData = getCountryByCode(userContext.countryCode);
  const officialName = countryData?.electionBody || userContext.electionBody || (userContext.countryName + ' Election Body');
  const officialUrl = countryData?.electionBodyUrl || userContext.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`;
  
  // 1. Try FAQ Engine first for specific election intents (Speed & Accuracy)
  if (intent !== 'unknown') {
    const faq = getFAQResponse(userContext.countryCode, intent, userContext.knowledgeLevel);
    if (faq) {
      logger.info('Assistant routing: FAQ matched', { intent, country: userContext.countryCode });
      return {
        content: faq.answer,
        source: 'faq',
        officialSource: { name: faq.sourceName, url: faq.sourceUrl },
        suggestedQuestions: faq.followUps,
      };
    }
  }

  // 2. Try Gemini AI if enabled
  if (aiEnabled) {
    try {
      const aiContent = await askAssistant(question, userContext, completedSteps, chatHistory);
      // Only fallback if AI explicitly says it's at capacity or offline
      if (aiContent) {
        logger.info('Assistant routing: AI generated');
        return {
          content: aiContent,
          source: 'ai',
          officialSource: { 
            name: officialName,
            url: officialUrl
          }
        };
      }
    } catch (err) {
      logger.error('Assistant routing: AI failed', err, { component: 'HybridAssistant' });
    }
  }

  // 3. Final Fallback (Generic helpful response)
  return {
    content: "I'm sorry, I couldn't find a specific answer for that. As a non-partisan guide, I recommend checking the official election commission website for the most accurate and up-to-date information.",
    source: 'fallback',
    officialSource: { 
      name: officialName, 
      url: officialUrl
    }
  };
}
