/**
 * Google Cloud Translation API v2 client.
 * In-memory cache prevents redundant API calls.
 * Falls back to original text on any error.
 */

import type { SupportedLanguage } from '@/types';
import { logger } from '@/lib/logger';
import { withTrace } from '@/lib/firebase/performance';
import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';

/** In-memory translation cache: key = `${text}:${lang}` */
const translationCache = new Map<string, string>();

const API_KEY = process.env.NEXT_PUBLIC_TRANSLATE_API_KEY ?? '';
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

let hasLoggedFirstResponse = false;

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * Translates a single text string to the target language.
 * Returns original text if target is English or on any error.
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sessionId?: string
): Promise<string> {
  return withTrace('translateText', { targetLang }, async () => {
    if (targetLang === 'en' || !text.trim()) return text;

    const cacheKey = `${text}:${targetLang}`;
    const cached = translationCache.get(cacheKey);
    if (cached) return cached;

    if (!API_KEY) {
      logger.error('API Key is missing. Set NEXT_PUBLIC_TRANSLATE_API_KEY.', null, { component: 'TranslateClient' });
      return text;
    }

    const limit = await checkRateLimit(sessionId ?? 'translate', 'translate');
    if (!limit.allowed) return text;

    try {
      const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Translation API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as TranslationResponse;
      
      if (!hasLoggedFirstResponse) {
        logger.info('First API response received', { component: 'TranslateClient' });
        hasLoggedFirstResponse = true;
      }

      const translated = data.data.translations[0].translatedText;
      translationCache.set(cacheKey, translated);
      await incrementUsage(sessionId ?? 'translate', 'translate');
      return translated;
    } catch (error) {
      logger.error('Translation failed', error, { component: 'TranslateClient' });
      return text;
    }
  });
}

/**
 * Translates multiple texts in a single API call for efficiency.
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage,
  sessionId?: string
): Promise<string[]> {
  return withTrace('translateBatch', { targetLang, count: String(texts.length) }, async () => {
    if (targetLang === 'en' || texts.length === 0) return texts;

    const uncached: { index: number; text: string }[] = [];
    const results = [...texts];

    texts.forEach((text, i) => {
      const cacheKey = `${text}:${targetLang}`;
      const cached = translationCache.get(cacheKey);
      if (cached) {
        results[i] = cached;
      } else if (text.trim()) {
        uncached.push({ index: i, text });
      }
    });

    if (uncached.length === 0) return results;

    if (!API_KEY) return results;

    const limit = await checkRateLimit(sessionId ?? 'translate', 'translate');
    if (!limit.allowed) return results;

    try {
      const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: uncached.map((u) => u.text),
          target: targetLang,
          format: 'text',
        }),
      });

      if (!response.ok) throw new Error(`Translation API error: ${response.status}`);

      const data = await response.json() as TranslationResponse;
      
      if (!hasLoggedFirstResponse) {
        logger.info('First Batch API response received', { component: 'TranslateClient' });
        hasLoggedFirstResponse = true;
      }

      data.data.translations.forEach((t, i) => {
        const entry = uncached[i];
        results[entry.index] = t.translatedText;
        translationCache.set(`${entry.text}:${targetLang}`, t.translatedText);
      });
      await incrementUsage(sessionId ?? 'translate', 'translate');
    } catch (error) {
      logger.error('Batch translation failed', error, { component: 'TranslateClient' });
    }

    return results;
  });
}

/**
 * Clears the in-memory translation cache.
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}
