/**
 * Gemini quiz generation and performance insight logic.
 */

import type { ElectionStep, KnowledgeLevel, MicroQuizQuestion, QuizQuestion, QuizResult } from '@/types';
import { buildMicroQuizPrompt, buildPersonalizedQuizPrompt, buildPerformanceInsightPrompt } from './prompts';
import { parseGeminiJSON, isMicroQuizQuestion, isQuizQuestionsArray } from './validator';
import { sanitizeAIResponse } from '@/lib/security/sanitize';
import { logger } from '@/lib/logger';
import { callGemini, callGeminiQuiz } from './core';

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
 * Builds a high-quality fallback quiz locally from steps data.
 */
export function generateLocalFallbackQuiz(
  steps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  if (steps.length === 0) return [];

  for (let i = 0; i < 5; i++) {
    const stepIndex = i % steps.length;
    const s = steps[stepIndex];
    if (!s) continue;

    const type = i < steps.length ? 'concept' : i < steps.length * 2 ? 'requirement' : 'tip';

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

    questions.push({
      id: `fallback_q${i + 1}_${s.id}`,
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
  return questions;
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
  const fallback = generateLocalFallbackQuiz(completedSteps, knowledgeLevel);
  if (completedSteps.length === 0) return [];

  const prompt = buildPersonalizedQuizPrompt(completedSteps, knowledgeLevel, countryCode);
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
