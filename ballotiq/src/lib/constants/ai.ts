/**
 * Shared constants for AI and UI limits.
 */

/** Maximum tokens for short Gemini responses (e.g., re-explanations) */
export const MAX_TOKENS_SHORT = 512;

/** Maximum tokens for medium Gemini responses (e.g., assessment analysis) */
export const MAX_TOKENS_MEDIUM = 1024;

/** Maximum tokens for long Gemini responses (e.g., full guides or quizzes) */
export const MAX_TOKENS_LONG = 2048;

/** Standard number of options for quiz questions */
export const QUIZ_OPTIONS_COUNT = 4;

/** Maximum character length for user chat input */
export const MAX_CHAT_INPUT_LENGTH = 300;
