/**
 * Security module: Input sanitization for all user-provided text
 * and AI-generated content before rendering.
 * Prevents XSS attacks and prompt injection.
 */

/** Maximum allowed length for user input */
const MAX_USER_INPUT_LENGTH = 500;

/** Maximum allowed length for AI response content */
const MAX_AI_RESPONSE_LENGTH = 5000;

/** HTML entity mapping for special character escaping */
const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#x27;',
};

/**
 * Sanitizes user-provided text input.
 * Strips HTML tags, limits length, removes prompt injection patterns,
 * and escapes special characters.
 * @param input - Raw user input string
 * @returns Sanitized string safe for use in prompts and rendering
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"']/g, (char) => HTML_ENTITIES[char] ?? char)
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/<<\/SYS>>/gi, '')
    .substring(0, MAX_USER_INPUT_LENGTH)
    .trim();
}

/**
 * Validates and sanitizes AI-generated text before rendering.
 * Strips any HTML that Gemini might have included, removes script tags,
 * and enforces maximum length.
 * @param response - Raw AI response string
 * @returns Sanitized string safe for rendering
 */
export function sanitizeAIResponse(response: string): string {
  if (!response || typeof response !== 'string') {
    return '';
  }

  return response
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, MAX_AI_RESPONSE_LENGTH)
    .trim();
}

/**
 * Strips markdown code fences from Gemini JSON responses.
 * Gemini often wraps JSON in ```json blocks despite prompt instructions.
 * @param raw - Raw response string potentially wrapped in code fences
 * @returns Clean JSON string ready for parsing
 */
export function sanitizeJSONResponse(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  return raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}
