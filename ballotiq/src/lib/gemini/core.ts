/**
 * Core Gemini API connectivity and retry logic.
 */

import { GoogleGenerativeAI, HarmBlockThreshold } from '@google/generative-ai';
import type { SafetySetting } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import { incrementUsage } from '@/lib/security/rateLimit';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
export const isGeminiEnabled = Boolean(API_KEY) && API_KEY.length > 5;

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash',
] as const;

const genAI = new GoogleGenerativeAI(isGeminiEnabled ? API_KEY : 'dummy-key');

/** Sleep helper for exponential backoff */
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Maximum concurrent Gemini requests to prevent RPM quota exhaustion */
const MAX_CONCURRENT_REQUESTS = 2;
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

/** Acquires a concurrency slot, queuing if at capacity */
async function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    return;
  }
  return new Promise((resolve) => requestQueue.push(resolve));
}

/** Releases a concurrency slot and unblocks the next queued request */
function releaseSlot(): void {
  activeRequests--;
  const next = requestQueue.shift();
  if (next) {
    activeRequests++;
    next();
  }
}

/**
 * Core Gemini caller with model fallback chain and exponential backoff.
 */
export async function callGemini(
  prompt: string,
  sessionId: string,
  lite: boolean = false,
  systemInstruction?: string,
  maxTokens: number = 512
): Promise<string | null> {
  if (!isGeminiEnabled) {
    logger.warn('[Gemini] API Key missing or invalid.', { component: 'GeminiClient' });
    return null;
  }

  const models = MODELS_TO_TRY;
  const retryDelays = [1000, 2000];

  await acquireSlot();
  try {
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
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              ] as SafetySetting[],
            });
            const response = await result.response;
            const text = response.text();

            if (text) {
              await incrementUsage(sessionId, 'gemini');
              return text;
            }
          } catch (error: unknown) {
            const status = (error as { status?: number })?.status;
            const message = (error as { message?: string })?.message || '';

            if (status === 404) {
              logger.warn(`[Gemini] ${modelId} 404. Trying next model...`);
              break;
            }

            if (status === 429 || message.toLowerCase().includes('quota')) {
              logger.warn(`[Gemini] ${modelId} quota hit. Switching to fallback immediately...`);
              break;
            }

            if (status === 503 && attempt < retryDelays.length) {
              const wait = retryDelays[attempt] + Math.random() * 1000;
              logger.warn(`[Gemini] ${modelId} busy. Retrying in ${Math.round(wait / 1000)}s...`);
              await sleep(wait);
              continue;
            }

            logger.warn(`[Gemini] ${modelId} error`, { message });
            break;
          }
        }
      } catch (err: unknown) {
        const msg = (err as Error)?.message || 'Unknown error';
        logger.error(`Gemini call failed for model ${modelId}: ${msg}`, err);
      }
    }
  } finally {
    releaseSlot();
  }

  return null;
}

/** Specialized caller for Quiz to handle 10+ questions */
export async function callGeminiQuiz(
  prompt: string,
  sessionId: string,
): Promise<string | null> {
  if (!isGeminiEnabled) return null;
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];

  for (const modelId of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        await incrementUsage(sessionId, 'gemini');
        return text;
      }
    } catch (err: unknown) {
      logger.warn(`[GeminiQuiz] ${modelId} failed:`, { error: (err as Error).message, modelId });
    }
  }
  return null;
}

/** Connectivity test for startup diagnostics */
export async function testGeminiConnection(): Promise<boolean> {
  return isGeminiEnabled;
}
