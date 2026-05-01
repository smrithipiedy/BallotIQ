/**
 * Gemini client core — model caller, concurrency limiter, and re-exports.
 * All domain-specific functions are in assessment.ts, guide.ts, quiz.ts, assistant.ts.
 * This module re-exports everything so no external import paths need to change.
 */

import { MAX_TOKENS_SHORT, MAX_TOKENS_LONG } from '@/lib/constants/ai';
import { incrementUsage } from '@/lib/security/rateLimit';

// ── Re-exports (preserves all existing import paths) ──────────────────
export { analyzeAssessment } from './assessment';
export { generatePersonalizedGuide } from './guide';
export { generateMicroQuiz, generatePersonalizedQuiz, generatePerformanceInsight } from './quiz';
export { askAssistant, reExplainConcept } from './assistant';

// ── Types ─────────────────────────────────────────────────────────────

type GeminiApiResponse = {
  text: string | null;
  error?: string;
};

interface GeminiApiParams {
  prompt: string;
  lite: boolean;
  kind: 'general' | 'quiz';
  systemInstruction?: string;
  maxTokens: number;
}

// ── Internal API caller ───────────────────────────────────────────────

/**
 * Low-level fetch wrapper for the /api/gemini proxy route.
 * @param params - API request parameters
 * @returns Raw text response or null on failure
 */
async function callGeminiApi(params: GeminiApiParams): Promise<string | null> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as GeminiApiResponse;
  return typeof data.text === 'string' ? data.text : null;
}

// ── Public callers ────────────────────────────────────────────────────

/**
 * Core Gemini caller with model fallback chain.
 * Increments rate-limit usage on successful response.
 * @param prompt - The user prompt
 * @param sessionId - Session identifier for rate limiting
 * @param lite - If true, uses the fastest model only
 * @param systemInstruction - Optional system prompt
 * @param maxTokens - Maximum generation tokens
 * @returns Raw text response or null
 */
export async function callGemini(
  prompt: string,
  sessionId: string,
  lite: boolean = false,
  systemInstruction?: string,
  maxTokens: number = MAX_TOKENS_SHORT,
): Promise<string | null> {
  const text = await callGeminiApi({
    prompt, lite, kind: 'general', systemInstruction, maxTokens,
  });

  if (text) {
    await incrementUsage(sessionId, 'gemini');
    return text;
  }

  return null;
}

/**
 * Specialized caller for quizzes that need higher token limits.
 * @param prompt - The quiz generation prompt
 * @param sessionId - Session identifier for rate limiting
 * @returns Raw text response or null
 */
export async function callGeminiQuiz(
  prompt: string,
  sessionId: string,
): Promise<string | null> {
  const text = await callGeminiApi({
    prompt, lite: false, kind: 'quiz', maxTokens: MAX_TOKENS_LONG,
  });

  if (text) await incrementUsage(sessionId, 'gemini');
  return text;
}

/**
 * Tests connectivity to the Gemini API proxy.
 * @returns True if the API is reachable and enabled
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const res = await fetch('/api/gemini', { method: 'GET' });
    if (!res.ok) return false;
    const data = (await res.json()) as { enabled?: boolean };
    return Boolean(data.enabled);
  } catch (error) {
    console.error('[Gemini] Connection test failed:', error);
    return false;
  }
}