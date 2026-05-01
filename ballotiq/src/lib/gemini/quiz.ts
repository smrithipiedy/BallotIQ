/**
 * Quiz generation via Gemini AI.
 * Handles micro-quizzes, personalized final quizzes, and performance insights.
 */

import type {
  ElectionStep,
  KnowledgeLevel,
  MicroQuizQuestion,
  QuizQuestion,
  QuizResult,
} from '@/types';
import {
  buildMicroQuizPrompt,
  buildPersonalizedQuizPrompt,
  buildPerformanceInsightPrompt,
} from './prompts';
import { parseGeminiJSON, isMicroQuizQuestion, isQuizQuestionsArray } from './validator';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { sanitizeAIResponse } from '@/lib/security/sanitize';
import { logger } from '@/lib/logger';
import { callGemini, callGeminiQuiz } from './client';

/**
 * Generates a micro-quiz question for a specific learning step.
 * Falls back to the step's embedded quiz or a generic question.
 * @param step - The election step to quiz on
 * @param knowledgeLevel - User's knowledge level for difficulty calibration
 * @param sessionId - Session identifier for rate limiting
 * @returns A single micro-quiz question with options
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

  const limit = await checkRateLimit(sessionId ?? 'microquiz', 'gemini');
  if (!limit.allowed) return fallback;

  const raw = await callGemini(prompt, sessionId ?? 'microquiz', true);
  if (!raw) return fallback;
  return parseGeminiJSON(raw, isMicroQuizQuestion, fallback);
}

/**
 * Generates a personalized 10-question final quiz from completed steps.
 * Deduplicates questions and falls back to step-derived questions if needed.
 * @param completedSteps - Steps the user has completed
 * @param knowledgeLevel - User's knowledge level
 * @param countryCode - ISO country code
 * @param sessionId - Session identifier for rate limiting
 * @returns Array of quiz questions (max 10)
 */
export async function generatePersonalizedQuiz(
  completedSteps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
  sessionId?: string,
): Promise<QuizQuestion[]> {
  const fallback: QuizQuestion[] = [];

  for (let i = 0; i < 10; i++) {
    const stepIndex = i % completedSteps.length;
    const s = completedSteps[stepIndex];
    if (!s) continue;

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
      id: `quiz_q${i + 1}`, question: q, options: opts, correctIndex: cIdx,
      explanation: s.detailedExplanation || s.description,
      difficulty: (knowledgeLevel === 'beginner' ? 'easy' : knowledgeLevel === 'intermediate' ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
      relatedStepId: s.id,
    });
  }

  const prompt = buildPersonalizedQuizPrompt(completedSteps, knowledgeLevel, countryCode);

  const limit = await checkRateLimit(sessionId ?? 'finalquiz', 'gemini');
  if (!limit.allowed) return fallback;

  const raw = await callGeminiQuiz(prompt, sessionId ?? 'finalquiz');
  if (raw) {
    const questions = parseGeminiJSON(raw, isQuizQuestionsArray, []);
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
 * Generates a post-quiz performance insight personalized to incorrect answers.
 * @param results - Array of individual question results
 * @param questions - The quiz questions that were attempted
 * @param knowledgeLevel - User's knowledge level
 * @param countryCode - ISO country code
 * @param sessionId - Session identifier for rate limiting
 * @returns A personalized performance summary string
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

  const limit = await checkRateLimit(sessionId ?? countryCode, 'gemini');
  if (!limit.allowed) return fallback;

  const raw = await callGemini(prompt, sessionId ?? countryCode, true);
  if (!raw) return fallback;
  return sanitizeAIResponse(raw);
}
