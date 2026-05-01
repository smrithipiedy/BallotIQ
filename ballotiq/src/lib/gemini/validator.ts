/**
 * Validates and safely parses all Gemini JSON responses.
 * Never lets malformed AI output crash the application.
 * Each validator is a type guard that checks fields individually.
 */

import type {
  ElectionStep,
  KnowledgeLevel,
  MicroQuizQuestion,
  QuizQuestion,
} from '@/types';
import { QUIZ_OPTIONS_COUNT } from '@/lib/constants/ai';
import { sanitizeJSONResponse } from '@/lib/security/sanitize';

/**
 * Checks whether an unknown value is a non-null object.
 * @param value - The value to check
 * @returns True if value is a plain object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safely reads a string field from an unknown object.
 * @param obj - The unknown object
 * @param key - The field name
 * @returns True if obj[key] is a string
 */
function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'string';
}

/**
 * Safely reads a number field from an unknown object.
 * @param obj - The unknown object
 * @param key - The field name
 * @returns True if obj[key] is a number
 */
function hasNumber(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'number';
}

/**
 * Safely checks if a field is an array.
 * @param obj - The unknown object
 * @param key - The field name
 * @returns True if obj[key] is an array
 */
function hasArray(obj: Record<string, unknown>, key: string): boolean {
  return Array.isArray(obj[key]);
}

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
        cleaned = cleaned.replace(/,?[^,}]+$/, '') + ']';
      } else if (cleaned.startsWith('{')) {
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
 * Type guard: validates a single ElectionStep object.
 * Checks each required field individually without type casts.
 * @param item - Unknown data to validate
 * @returns True if item is a valid ElectionStep
 */
function isElectionStep(item: unknown): item is ElectionStep {
  if (!isRecord(item)) return false;
  return (
    hasString(item, 'id') &&
    hasNumber(item, 'order') &&
    hasString(item, 'title') &&
    hasString(item, 'description') &&
    hasString(item, 'detailedExplanation') &&
    hasString(item, 'simpleExplanation') &&
    hasString(item, 'timeline') &&
    hasArray(item, 'requirements') &&
    hasArray(item, 'tips')
  );
}

/**
 * Type guard: validates an array of ElectionStep objects.
 * @param data - Unknown data to validate
 * @returns True if data is a valid ElectionStep array
 */
export function isElectionStepsArray(data: unknown): data is ElectionStep[] {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(isElectionStep);
}

/**
 * Type guard: validates a single QuizQuestion object.
 * @param item - Unknown data to validate
 * @returns True if item is a valid QuizQuestion
 */
function isQuizQuestion(item: unknown): item is QuizQuestion {
  if (!isRecord(item)) return false;
  return (
    hasString(item, 'id') &&
    hasString(item, 'question') &&
    Array.isArray(item['options']) &&
    (item['options'] as unknown[]).length === QUIZ_OPTIONS_COUNT &&
    hasNumber(item, 'correctIndex') &&
    (item['correctIndex'] as number) >= 0 &&
    (item['correctIndex'] as number) <= 3 &&
    hasString(item, 'explanation')
  );
}

/**
 * Type guard: validates an array of QuizQuestion objects.
 * @param data - Unknown data to validate
 * @returns True if data is a valid QuizQuestion array
 */
export function isQuizQuestionsArray(data: unknown): data is QuizQuestion[] {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(isQuizQuestion);
}

/**
 * Type guard: validates a MicroQuizQuestion object.
 * Checks for question text, 4 options, valid index, and hint.
 * @param data - Unknown data to validate
 * @returns True if data is a valid MicroQuizQuestion
 */
export function isMicroQuizQuestion(data: unknown): data is MicroQuizQuestion {
  if (!isRecord(data)) return false;
  return (
    hasString(data, 'question') &&
    Array.isArray(data['options']) &&
    (data['options'] as unknown[]).length === QUIZ_OPTIONS_COUNT &&
    hasNumber(data, 'correctIndex') &&
    (data['correctIndex'] as number) >= 0 &&
    (data['correctIndex'] as number) <= 3 &&
    hasString(data, 'hint')
  );
}

/** Valid knowledge levels for assessment validation */
const VALID_LEVELS: readonly string[] = ['beginner', 'intermediate', 'advanced'];

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
  if (!isRecord(data)) return false;
  return (
    hasString(data, 'knowledgeLevel') &&
    VALID_LEVELS.includes(data['knowledgeLevel'] as string) &&
    hasNumber(data, 'recommendedStepCount') &&
    (data['recommendedStepCount'] as number) > 0 &&
    hasArray(data, 'focusAreas')
  );
}
