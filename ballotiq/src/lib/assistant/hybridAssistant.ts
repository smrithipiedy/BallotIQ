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
import { COUNTRIES, getCountryByCode } from '@/lib/constants/countries';

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
  const normalizedQuestion = question.trim().toLowerCase();
  const intent = detectIntent(question);
  const countryData = getCountryByCode(userContext.countryCode);
  const officialName = countryData?.electionBody || userContext.electionBody || (userContext.countryName + ' Election Body');
  const officialUrl = countryData?.electionBodyUrl || userContext.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`;

  // 0. Contextual Scope Guard
  // If there is history, we are more lenient with the topic filter to allow "continue", "why?", etc.
  const isOnTopic = isAllowedTopic(normalizedQuestion, chatHistory.length > 0);
  if (!isOnTopic) {
    return {
      content: `I can only help with elections, voting, and civic politics. I am not built for unrelated topics. You can ask about voter registration, eligibility, election dates, polling stations, voting process, election rules, political systems, or how elections work in ${userContext.countryName}.`,
      source: 'fallback',
      officialSource: {
        name: officialName,
        url: officialUrl
      }
    };
  }

  const mentionedCountry = detectMentionedCountry(normalizedQuestion);
  if (mentionedCountry && mentionedCountry.code !== userContext.countryCode.toUpperCase()) {
    return {
      content: `Your current assistant is configured for ${userContext.countryName}. I cannot answer election process questions for ${mentionedCountry.name} in this session. Please switch country from the home page and then ask again.`,
      source: 'fallback',
      officialSource: {
        name: officialName,
        url: officialUrl
      }
    };
  }
  
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

function isAllowedTopic(question: string, hasHistory: boolean): boolean {
  // Common follow-up words that should be allowed if a conversation is already active
  const followUpKeywords = [
    'continue', 'more', 'elaborate', 'why', 'how', 'explain', 'tell me', 'next', 'back', 'previous',
    'yes', 'no', 'sure', 'okay', 'thanks', 'thank you', 'please', 'details'
  ];

  const civicKeywords = [
    'election', 'elections', 'vote', 'voting', 'voter', 'ballot', 'booth', 'poll', 'polling',
    'constituency', 'candidate', 'campaign', 'manifesto', 'democracy', 'parliament', 'assembly',
    'president', 'prime minister', 'senate', 'congress', 'governor', 'mayor', 'municipal',
    'registration', 'electoral roll', 'epic', 'evm', 'vvpat', 'commission', 'politic', 'policy',
    'government', 'governance', 'public office', 'party', 'coalition', 'ideology', 'civic',
    'representative', 'legislature', 'judiciary', 'executive', 'constitution', 'amendment',
    'right', 'duty', 'citizen', 'participation', 'polling station', 'counting', 'result'
  ];

  const onTopic = civicKeywords.some((k) => question.includes(k));
  if (onTopic) return true;

  // If already in a conversation, allow common follow-up words even if they lack civic keywords
  if (hasHistory) {
    const isFollowUp = followUpKeywords.some((k) => {
      // Use word boundary to avoid partial matches like "back" in "background"
      const regex = new RegExp(`\\b${k}\\b`, 'i');
      return regex.test(question);
    });
    if (isFollowUp) return true;
  }

  return false;
}

function detectMentionedCountry(question: string): { code: string; name: string } | null {
  const matched = COUNTRIES.find((country) => question.includes(country.name.toLowerCase()));
  return matched ? { code: matched.code, name: matched.name } : null;
}
