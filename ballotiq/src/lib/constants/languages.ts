/**
 * Supported languages for BallotIQ.
 * Maps language codes to display names and Google Translate codes.
 */

import type { SupportedLanguage } from '@/types';

/** Language metadata for UI display and API calls */
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  googleTranslateCode: string;
  googleTTSCode: string;
}

/** All 8 supported languages with metadata */
export const LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    googleTranslateCode: 'en',
    googleTTSCode: 'en-US',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    googleTranslateCode: 'hi',
    googleTTSCode: 'hi-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    googleTranslateCode: 'ta',
    googleTTSCode: 'ta-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    googleTranslateCode: 'te',
    googleTTSCode: 'te-IN',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    googleTranslateCode: 'fr',
    googleTTSCode: 'fr-FR',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    googleTranslateCode: 'es',
    googleTTSCode: 'es-ES',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    googleTranslateCode: 'de',
    googleTTSCode: 'de-DE',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    googleTranslateCode: 'ar',
    googleTTSCode: 'ar-XA',
  },
];

/**
 * Retrieves language info by code.
 * @param code - SupportedLanguage code
 * @returns LanguageInfo or undefined if not found
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

/**
 * Returns the text direction for a given language.
 * @param code - SupportedLanguage code
 * @returns 'ltr' or 'rtl', defaults to 'ltr'
 */
export function getTextDirection(code: SupportedLanguage): 'ltr' | 'rtl' {
  return getLanguageInfo(code)?.direction ?? 'ltr';
}
