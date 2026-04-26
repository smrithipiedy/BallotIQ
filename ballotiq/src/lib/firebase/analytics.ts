/**
 * Firebase Analytics custom events for learning progress tracking.
 * Provides insight into how users interact with BallotIQ.
 * All events are wrapped in try/catch — analytics must never crash the app.
 */

import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { getFirebaseApp } from './client';
import type { AdaptationReason, KnowledgeLevel } from '@/types';

/** Cached analytics instance */
let analyticsInstance: Analytics | null = null;

/**
 * Gets the Firebase Analytics instance, initializing if needed.
 * Returns null if analytics is not supported in the current environment.
 * @returns Analytics instance or null
 */
async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    analyticsInstance = getAnalytics(getFirebaseApp());
    return analyticsInstance;
  } catch {
    return null;
  }
}

/**
 * Logs completion of the diagnostic assessment.
 * @param knowledgeLevel - Determined knowledge level
 * @param countryCode - Selected country
 */
export async function logAssessmentComplete(
  knowledgeLevel: KnowledgeLevel,
  countryCode: string
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'assessment_complete', {
      knowledge_level: knowledgeLevel,
      country_code: countryCode,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log assessment_complete:', error);
  }
}

/**
 * Logs completion of a learning step.
 * @param stepId - Identifier of the completed step
 * @param countryCode - Country being studied
 * @param timeSpentSeconds - Time spent on the step
 */
export async function logStepComplete(
  stepId: string,
  countryCode: string,
  timeSpentSeconds: number
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'step_complete', {
      step_id: stepId,
      country_code: countryCode,
      time_spent_seconds: timeSpentSeconds,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log step_complete:', error);
  }
}

/**
 * Logs a micro-quiz result after a learning step.
 * @param stepId - Identifier of the tested step
 * @param correct - Whether the answer was correct
 * @param attempts - Number of attempts made
 */
export async function logMicroQuizResult(
  stepId: string,
  correct: boolean,
  attempts: number
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'micro_quiz_result', {
      step_id: stepId,
      correct,
      attempts,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log micro_quiz_result:', error);
  }
}

/**
 * Logs when the adaptive learning system triggers a difficulty change.
 * @param reason - Why adaptation was triggered
 * @param stepIndex - Current step index when triggered
 */
export async function logAdaptationTriggered(
  reason: AdaptationReason,
  stepIndex: number
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'adaptation_triggered', {
      reason,
      step_index: stepIndex,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log adaptation_triggered:', error);
  }
}

/**
 * Logs completion of the final certification quiz.
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @param countryCode - Country being studied
 */
export async function logQuizComplete(
  score: number,
  total: number,
  countryCode: string
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'quiz_complete', {
      score,
      total,
      country_code: countryCode,
      percentage: Math.round((score / total) * 100),
    });
  } catch (error) {
    console.error('[Analytics] Failed to log quiz_complete:', error);
  }
}

/**
 * Logs when the user changes the display language.
 * @param from - Previous language code
 * @param to - New language code
 */
export async function logLanguageChanged(
  from: string,
  to: string
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'language_changed', {
      from_language: from,
      to_language: to,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log language_changed:', error);
  }
}

/**
 * Logs when a user asks a question in the AI assistant.
 * @param countryCode - Country context
 * @param knowledgeLevel - User's knowledge level
 */
export async function logAssistantQuestion(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel
): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    logEvent(analytics, 'assistant_question', {
      country_code: countryCode,
      knowledge_level: knowledgeLevel,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log assistant_question:', error);
  }
}
