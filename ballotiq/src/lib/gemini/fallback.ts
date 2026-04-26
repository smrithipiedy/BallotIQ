/**
 * Entry point for static fallback content.
 * Centralizes country-specific data to keep individual file sizes small (<200 lines).
 * Ensures the app remains functional even if Gemini API fails or is disabled.
 */

import type { ElectionStep, KnowledgeLevel } from '@/types';
import { IN_BEGINNER } from './fallback-data/india';
import { US_BEGINNER } from './fallback-data/us';
import { GB_BEGINNER } from './fallback-data/uk';
import { SA_BEGINNER } from './fallback-data/saudi';
import { BR_BEGINNER } from './fallback-data/brazil';
import { FR_BEGINNER } from './fallback-data/france';
import { DE_BEGINNER } from './fallback-data/germany';
import { AU_BEGINNER } from './fallback-data/australia';
import { CA_BEGINNER } from './fallback-data/canada';

/** Complete registry of fallback guides by country and level */
export const FALLBACK_GUIDES: Record<string, Record<KnowledgeLevel, ElectionStep[]>> = {
  IN: { beginner: IN_BEGINNER, intermediate: IN_BEGINNER, advanced: IN_BEGINNER },
  US: { beginner: US_BEGINNER, intermediate: US_BEGINNER, advanced: US_BEGINNER },
  GB: { beginner: GB_BEGINNER, intermediate: GB_BEGINNER, advanced: GB_BEGINNER },
  SA: { beginner: SA_BEGINNER, intermediate: SA_BEGINNER, advanced: SA_BEGINNER },
  FR: { beginner: FR_BEGINNER, intermediate: FR_BEGINNER, advanced: FR_BEGINNER },
  DE: { beginner: DE_BEGINNER, intermediate: DE_BEGINNER, advanced: DE_BEGINNER },
  BR: { beginner: BR_BEGINNER, intermediate: BR_BEGINNER, advanced: BR_BEGINNER },
  AU: { beginner: AU_BEGINNER, intermediate: AU_BEGINNER, advanced: AU_BEGINNER },
  CA: { beginner: CA_BEGINNER, intermediate: CA_BEGINNER, advanced: CA_BEGINNER },
};

/**
 * Retrieves a high-depth fallback guide for a country and knowledge level.
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @param knowledgeLevel - User's starting level
 * @returns Array of 5+ election steps
 */
export function getFallbackGuide(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel
): ElectionStep[] | null {
  const code = countryCode.toUpperCase();
  const countryGuides = FALLBACK_GUIDES[code];

  if (countryGuides) {
    const steps = countryGuides[knowledgeLevel];
    if (steps) return [...steps];
  }

  // Universal fallback for unsupported countries
  return FALLBACK_GUIDES.GB[knowledgeLevel];
}
