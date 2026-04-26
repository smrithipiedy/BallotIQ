/**
 * Gemini client optimized for quota efficiency and production stability.
 * Model priority: gemini-2.0-flash → gemini-1.5-flash → fallback content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AssessmentAnswer,
  ChatMessage,
  ElectionStep,
  KnowledgeLevel,
  MicroQuizQuestion,
  QuizQuestion,
  QuizResult,
  UserContext,
} from '@/types';
import {
  buildAssessmentAnalysisPrompt,
  buildPersonalizedGuidePrompt,
  buildMicroQuizPrompt,
  buildReExplanationPrompt,
  buildPersonalizedQuizPrompt,
  buildAssistantSystemPrompt,
  buildAssistantUserMessage,
  buildPerformanceInsightPrompt,
} from './prompts';
import {
  parseGeminiJSON,
  isAssessmentResult,
  isElectionStepsArray,
  isMicroQuizQuestion,
  isQuizQuestionsArray,
} from './validator';
import { getFallbackGuide } from './fallback';
import { getCachedGuide, cacheElectionGuide } from '@/lib/firebase/firestore';
import { sanitizeAIResponse } from '@/lib/security/sanitize';
import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';
import { authReady } from '@/lib/firebase/client';
import { withTrace } from '@/lib/firebase/performance';
import { logger } from '@/lib/logger';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
const isGeminiEnabled =
  Boolean(API_KEY) &&
  API_KEY !== 'YOUR_GEMINI_API_KEY' &&
  API_KEY !== 'your_gemini_api_key_here' &&
  API_KEY.length > 10;

/**
 * Model priority order for free tier.
 * gemini-2.0-flash-lite: Fastest, high quota.
 * gemini-2.0-flash: Capable, high quota.
 * gemini-1.5-flash: Most stable fallback.
 */
const MODELS_TO_TRY = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash'
] as const;

// Initialize genAI once
const genAI = new GoogleGenerativeAI(isGeminiEnabled ? API_KEY : 'dummy-key');

/** Sleep helper for exponential backoff */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Core Gemini caller with model fallback chain and exponential backoff.
 * @param lite - If true, only uses the fastest model (Gemini Flash Lite).
 * @param systemInstruction - Optional system prompt for instruction-following.
 */
async function callGemini(
  prompt: string,
  sessionId: string,
  lite: boolean = false,
  systemInstruction?: string,
  maxTokens: number = 512
): Promise<string | null> {
  if (!isGeminiEnabled) {
    console.warn('[Gemini] API Key missing or invalid.');
    return null;
  }

  const models = lite ? ['gemini-2.0-flash-lite-001', 'gemini-1.5-flash'] : MODELS_TO_TRY;
  const retryDelays = lite ? [1000] : [2000, 5000];

  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
          temperature: lite ? 0.1 : 0.3,
          maxOutputTokens: maxTokens
        },
        systemInstruction,
      });

      for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          if (text) {
            await incrementUsage(sessionId, 'gemini');
            return text;
          }
        } catch (error: any) {
          const status = error?.status;
          const message = error?.message || '';

          // 404: Model not available in this region/key
          if (status === 404) {
            console.warn(`[Gemini] ${modelId} 404. Trying next model...`);
            break;
          }

          // 429: Quota Exceeded - Move to NEXT MODEL immediately
          if (status === 429 || message.toLowerCase().includes('quota')) {
            console.warn(`[Gemini] ${modelId} quota hit. Switching to fallback immediately...`);
            break;
          }

          // 503: Overloaded - Retry with delay
          if (status === 503 && attempt < retryDelays.length) {
            const wait = retryDelays[attempt] + Math.random() * 1000;
            console.warn(`[Gemini] ${modelId} busy. Retrying in ${Math.round(wait / 1000)}s...`);
            await sleep(wait);
            continue;
          }

          // Other errors
          console.warn(`[Gemini] ${modelId} error:`, message);
          break; // Move to next model
        }
      }
    } catch (modelError) {
      logger.error('Failed to initialize model', modelError, { component: 'GeminiClient', modelId });
    }
  }

  return null;
}

/**
 * Specialized caller for Quiz to handle 10+ questions (needs more tokens)
 */
async function callGeminiQuiz(
  prompt: string,
  sessionId: string,
): Promise<string | null> {
  if (!isGeminiEnabled) return null;
  const models = MODELS_TO_TRY;

  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048 // Increased for 10 questions
        }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        await incrementUsage(sessionId, 'gemini');
        return text;
      }
    } catch (err) {
      console.warn(`[GeminiQuiz] ${modelId} failed:`, err);
    }
  }
  return null;
}

/**
 * Analyzes assessment answers to determine knowledge level.
 */
export async function analyzeAssessment(
  answers: AssessmentAnswer,
  countryCode: string,
  countryName: string,
): Promise<{ knowledgeLevel: KnowledgeLevel; recommendedStepCount: number; focusAreas: string[] }> {
  const fallback = {
    knowledgeLevel: (
      answers.selfRatedKnowledge <= 2 ? 'beginner' :
        answers.selfRatedKnowledge <= 4 ? 'intermediate' : 'advanced'
    ) as KnowledgeLevel,
    recommendedStepCount: answers.selfRatedKnowledge <= 2 ? 6 : answers.selfRatedKnowledge <= 4 ? 8 : 10,
    focusAreas: [answers.mainConfusion || 'general election process'],
  };

  const prompt = buildAssessmentAnalysisPrompt(answers, countryCode, countryName);
  const raw = await callGemini(prompt, 'assessment', true, undefined, 1024);
  if (!raw) return fallback;
  return parseGeminiJSON(raw, isAssessmentResult, fallback);
}

/**
 * Generates election steps personalized to user's knowledge level.
 */
export async function generatePersonalizedGuide(
  countryCode: string,
  countryName: string,
  knowledgeLevel: KnowledgeLevel,
  focusAreas: string[],
  userConfusion: string,
  sessionId?: string,
): Promise<{ steps: ElectionStep[]; source: 'gemini' | 'cache' | 'fallback' }> {
  return withTrace(
    'gemini_generate_guide',
    { countryCode, knowledgeLevel },
    async () => {
      try {
        await authReady;
        const cached = await getCachedGuide(countryCode, knowledgeLevel);
        // Only use cache if it meets our new depth standards
        if (cached && cached.length >= 5) {
          return { steps: cached, source: 'cache' };
        }
        if (cached) {
          logger.warn('Ignoring shallow cache', { countryCode, count: String(cached.length) });
        }
      } catch { /* ignore cache errors */ }

      const prompt = buildPersonalizedGuidePrompt(
        countryCode, countryName, knowledgeLevel, focusAreas, userConfusion,
      );
      const raw = await callGemini(prompt, sessionId ?? 'guide', false, undefined, 2048);
      if (raw) {
        const steps = parseGeminiJSON(raw, isElectionStepsArray, []);
        // Enforce minimum 5 steps from AI
        if (steps.length >= 5) {
          try { await cacheElectionGuide(countryCode, knowledgeLevel, steps); } catch { /* ignore */ }
          return { steps, source: 'gemini' };
        }
        logger.warn('Gemini returned insufficient steps', {
          countryCode,
          stepCount: String(steps.length)
        });
      }

      return { steps: getFallbackGuide(countryCode, knowledgeLevel) ?? [], source: 'fallback' };
    }
  );
}

/**
 * Generates a micro-quiz question for a specific step.
 */
export async function generateMicroQuiz(
  step: ElectionStep,
  knowledgeLevel: KnowledgeLevel,
  sessionId?: string,
): Promise<MicroQuizQuestion> {
  const fallback: MicroQuizQuestion = step.microQuizQuestion ?? {
    question: `What is the key concept of "${step.title}"?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
    hint: 'Review the step content carefully.',
  };

  const prompt = buildMicroQuizPrompt(step, knowledgeLevel);
  const raw = await callGemini(prompt, sessionId ?? 'microquiz', true);
  if (!raw) return fallback;
  return parseGeminiJSON(raw, isMicroQuizQuestion, fallback);
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

/**
 * Generates personalized final quiz from the steps this user actually completed.
 */
export async function generatePersonalizedQuiz(
  completedSteps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
  sessionId?: string,
): Promise<QuizQuestion[]> {
  const fallback: QuizQuestion[] = [];

  // Build a 10-question fallback by extracting DIFFERENT facts from each step
  for (let i = 0; i < 10; i++) {
    const stepIndex = i % completedSteps.length;
    const s = completedSteps[stepIndex];
    if (!s) continue;

    // Cycle through different "types" of questions for the same step to avoid repetition
    const type = i < completedSteps.length ? 'concept' : i < completedSteps.length * 2 ? 'requirement' : 'tip';

    let q = `Regarding ${s.title}, what is most important?`;
    let opts = s.microQuizQuestion?.options ?? ['Correct', 'Incorrect 1', 'Incorrect 2', 'Incorrect 3'];
    let cIdx = s.microQuizQuestion?.correctIndex ?? 0;

    if (type === 'concept') {
      q = s.microQuizQuestion?.question ?? `What is the main purpose of ${s.title}?`;
    } else if (type === 'requirement' && s.requirements.length > 0) {
      q = `Which of these is a requirement for ${s.title}?`;
      opts = [s.requirements[0], 'A non-official document', 'A library card', 'No ID required'];
      cIdx = 0;
    } else if (type === 'tip' && s.tips.length > 0) {
      q = `A helpful tip for ${s.title} is:`;
      opts = [s.tips[0], 'Wait until the last minute', 'Ignore official notices', 'Only vote in the evening'];
      cIdx = 0;
    }

    fallback.push({
      id: `quiz_q${i + 1}`,
      question: q,
      options: opts,
      correctIndex: cIdx,
      explanation: s.detailedExplanation || s.description,
      difficulty: (
        knowledgeLevel === 'beginner' ? 'easy' :
          knowledgeLevel === 'intermediate' ? 'medium' : 'hard'
      ) as 'easy' | 'medium' | 'hard',
      relatedStepId: s.id,
    });
  }

  const prompt = buildPersonalizedQuizPrompt(completedSteps, knowledgeLevel, countryCode);
  const raw = await callGeminiQuiz(prompt, sessionId ?? 'finalquiz');
  if (raw) {
    const questions = parseGeminiJSON(raw, isQuizQuestionsArray, []);

    // Deduplicate by question text to be absolutely sure
    const uniqueQuestions: QuizQuestion[] = [];
    const seen = new Set<string>();

    for (const q of questions) {
      if (!seen.has(q.question.toLowerCase().trim())) {
        seen.add(q.question.toLowerCase().trim());
        uniqueQuestions.push(q);
      }
    }

    if (uniqueQuestions.length >= 10) return uniqueQuestions.slice(0, 10);
    logger.warn('AI returned duplicate or insufficient quiz questions, using fallback', {
      countryCode, originalCount: String(questions.length), uniqueCount: String(uniqueQuestions.length)
    });
  }
  return fallback;
}

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
        return 'The AI assistant is unavailable because the Gemini API key is not configured.';
      }

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
 * Post-quiz performance insight personalized to what this user got wrong.
 */
export async function generatePerformanceInsight(
  results: QuizResult[],
  questions: QuizQuestion[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
  sessionId?: string,
): Promise<string> {
  const score = results.filter((r) => r.isCorrect).length;
  const fallback = `You scored ${score}/${results.length}. Keep exploring the guide to strengthen your knowledge.`;
  const prompt = buildPerformanceInsightPrompt(results, questions, knowledgeLevel);
  const raw = await callGemini(prompt, sessionId ?? countryCode, true);
  if (!raw) return fallback;
  return sanitizeAIResponse(raw);
}

export async function testGeminiConnection(): Promise<boolean> {
  return isGeminiEnabled;
}