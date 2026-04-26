/**
 * Gemini client optimized for quota efficiency and production stability.
 * Model priority: gemini-2.0-flash → gemini-1.5-flash → fallback content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';

export function isGeminiEnabled(): boolean {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  return (
    Boolean(key) &&
    key !== 'YOUR_GEMINI_API_KEY' &&
    key !== 'your_gemini_api_key_here' &&
    key.length > 10
  );
}

/**
 * Model priority order for free tier.
 */
const MODELS_TO_TRY = [
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
] as const;

/** Get fresh client with current API key (supports .env.local hot-reload) */
function getClient(): GoogleGenerativeAI {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  // Force v1beta for maximum model compatibility (fixes 404s on 1.5/2.0 models)
  return new GoogleGenerativeAI(key);
}

/** Sleep helper for exponential backoff */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Core Gemini caller with model fallback chain and exponential backoff.
 * @param lite - If true, only uses the fastest model (Gemini Flash Lite).
 * @param systemInstruction - Optional system prompt for instruction-following.
 */
export async function callGemini(
  prompt: string,
  sessionId: string,
  lite: boolean = false,
  systemInstruction?: string
): Promise<string | null> {
  if (!isGeminiEnabled()) {
    console.warn('[Gemini] API Key missing or invalid.');
    return null;
  }

  // Restoration of safe, high-availability models
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-2.0-flash-lite-001',
    'gemini-2.0-flash-001',
  ];
  const retryDelays = lite ? [1000, 2000] : [2000, 4000, 8000];

  for (const modelId of models) {
    try {
      const genAI = getClient();
      const model = genAI.getGenerativeModel({
        model: modelId,
        apiVersion: 'v1beta',
        generationConfig: {
          temperature: lite ? 0.1 : 0.3,
          maxOutputTokens: lite ? 300 : 800
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

          // 429/503: Quota or Overload
          if (status === 429 || status === 503 || message.includes('quota')) {
            if (message.includes('limit: 0')) {
              console.error(`[Gemini] Model ${modelId} has ZERO quota (limit: 0). Skipping model.`);
              break; // Skip to next model immediately
            }
            if (attempt < retryDelays.length) {
              const wait = retryDelays[attempt] + Math.random() * 1000;
              console.warn(`[Gemini] ${modelId} rate limited. Retrying in ${Math.round(wait / 1000)}s...`);
              await sleep(wait);
              continue;
            }
          }

          // Other errors (Safety, internal, etc.)
          console.error(`[Gemini] ${modelId} error (Attempt ${attempt + 1}):`, error);
          break; // Move to next model
        }
      }
    } catch (modelError) {
      console.error(`[Gemini] Failed to initialize model ${modelId}:`, modelError);
    }
  }

  return null;
}

/**
 * Specialized caller for quiz generation to ensure higher quality.
 */
export async function callGeminiQuiz(prompt: string, sessionId: string): Promise<string | null> {
  return callGemini(prompt, sessionId, true); // Use lite model for faster quiz generation
}

export async function testGeminiConnection(): Promise<boolean> {
  return isGeminiEnabled();
}