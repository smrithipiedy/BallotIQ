/**
 * Validates and safely parses all Gemini JSON responses.
 * Never lets malformed AI output crash the application.
 * Each validator is a type guard that ensures structural correctness.
 */

import type {
  ElectionStep,
  KnowledgeLevel,
  MicroQuizQuestion,
  QuizQuestion,
} from '@/types';
import { sanitizeJSONResponse } from '@/lib/security/sanitize';

/**
 * Safely parses a Gemini JSON response with validation.
 * 1. Sanitizes raw string (strips markdown fences)
 * 2. Attempts JSON.parse in try/catch
 * 3. Runs type validator function
 * 4. Returns fallback if any step fails
 * @param raw - Raw response string from Gemini
 * @param validator - Type guard function to validate parsed data
 * @param fallback - Default value returned if parsing or validation fails
 * @returns Parsed and validated data, or fallback
 */
export function parseGeminiJSON<T>(
  raw: string,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  let cleaned = sanitizeJSONResponse(raw);
  if (!cleaned) {
    console.warn('[Validator] Empty response after sanitization');
    return fallback;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Attempt basic repair for truncated JSON responses
    try {
      if (cleaned.startsWith('[')) {
        // Remove trailing partial items and close array
        cleaned = cleaned.replace(/,?[^,}]+$/, '') + ']';
      } else if (cleaned.startsWith('{')) {
        // Remove trailing partial items and close object
        cleaned = cleaned.replace(/,?[^,}]+$/, '') + '}';
      }
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn('[Validator] Could not parse or repair Gemini JSON. Using fallback.');
      return fallback;
    }
  }

  if (!validator(parsed)) {
    console.warn('[Validator] Response failed type validation. Using fallback.');
    return fallback;
  }

  return parsed;
}

/**
 * Type guard: validates an array of ElectionStep objects.
 * Checks that each element has all required fields with correct types.
 * @param data - Unknown data to validate
 * @returns True if data is a valid ElectionStep array
 */
export function isElectionStepsArray(data: unknown): data is ElectionStep[] {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const step = item as Record<string, unknown>;
    return (
      typeof step['id'] === 'string' &&
      typeof step['order'] === 'number' &&
      typeof step['title'] === 'string' &&
      typeof step['description'] === 'string' &&
      typeof step['detailedExplanation'] === 'string' &&
      typeof step['simpleExplanation'] === 'string' &&
      typeof step['timeline'] === 'string' &&
      Array.isArray(step['requirements']) &&
      Array.isArray(step['tips'])
    );
  });
}

/**
 * Type guard: validates an array of QuizQuestion objects.
 * Ensures each question has options, correct index, and explanation.
 * @param data - Unknown data to validate
 * @returns True if data is a valid QuizQuestion array
 */
export function isQuizQuestionsArray(data: unknown): data is QuizQuestion[] {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const q = item as Record<string, unknown>;
    return (
      typeof q['id'] === 'string' &&
      typeof q['question'] === 'string' &&
      Array.isArray(q['options']) &&
      q['options'].length === 4 &&
      typeof q['correctIndex'] === 'number' &&
      q['correctIndex'] >= 0 &&
      q['correctIndex'] <= 3 &&
      typeof q['explanation'] === 'string'
    );
  });
}

/**
 * Type guard: validates a MicroQuizQuestion object.
 * Checks for question text, 4 options, valid index, and hint.
 * @param data - Unknown data to validate
 * @returns True if data is a valid MicroQuizQuestion
 */
export function isMicroQuizQuestion(data: unknown): data is MicroQuizQuestion {
  if (typeof data !== 'object' || data === null) return false;
  const q = data as Record<string, unknown>;
  return (
    typeof q['question'] === 'string' &&
    Array.isArray(q['options']) &&
    q['options'].length === 4 &&
    typeof q['correctIndex'] === 'number' &&
    q['correctIndex'] >= 0 &&
    q['correctIndex'] <= 3 &&
    typeof q['hint'] === 'string'
  );
}

/** Shape of the assessment analysis result from Gemini */
interface AssessmentResultShape {
  knowledgeLevel: KnowledgeLevel;
  recommendedStepCount: number;
  focusAreas: string[];
}

/**
 * Type guard for assessment analysis result from Gemini.
 * Validates knowledge level is one of the three valid values.
 * @param data - Unknown data to validate
 * @returns True if data matches the expected assessment result shape
 */
export function isAssessmentResult(
  data: unknown
): data is AssessmentResultShape {
  if (typeof data !== 'object' || data === null) return false;
  const r = data as Record<string, unknown>;
  const validLevels: KnowledgeLevel[] = ['beginner', 'intermediate', 'advanced'];
  return (
    typeof r['knowledgeLevel'] === 'string' &&
    validLevels.includes(r['knowledgeLevel'] as KnowledgeLevel) &&
    typeof r['recommendedStepCount'] === 'number' &&
    r['recommendedStepCount'] > 0 &&
    Array.isArray(r['focusAreas'])
  );
}
