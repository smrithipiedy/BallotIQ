/**
 * Supported countries with election metadata.
 * Each country includes official election body details,
 * supported languages, and voting requirements.
 */

import type { Country } from '@/types';

/** All countries supported by BallotIQ */
export const COUNTRIES: Country[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    electionType: 'Parliamentary Democracy',
    votingAge: 18,
    electionBody: 'Election Commission of India',
    electionBodyUrl: 'https://eci.gov.in',
    languages: ['en', 'hi', 'ta', 'te'],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    electionType: 'Federal Republic',
    votingAge: 18,
    electionBody: 'Federal Election Commission',
    electionBodyUrl: 'https://www.fec.gov',
    languages: ['en', 'es'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    electionType: 'Constitutional Monarchy',
    votingAge: 18,
    electionBody: 'Electoral Commission',
    electionBodyUrl: 'https://www.electoralcommission.org.uk',
    languages: ['en'],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    electionType: 'Federal Parliamentary Republic',
    votingAge: 18,
    electionBody: 'Federal Returning Officer',
    electionBodyUrl: 'https://www.bundeswahlleiter.de',
    languages: ['de', 'en'],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    electionType: 'Semi-Presidential Republic',
    votingAge: 18,
    electionBody: 'Constitutional Council',
    electionBodyUrl: 'https://www.conseil-constitutionnel.fr',
    languages: ['fr', 'en'],
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    electionType: 'Federal Presidential Republic',
    votingAge: 16,
    electionBody: 'Superior Electoral Court',
    electionBodyUrl: 'https://www.tse.jus.br',
    languages: ['es', 'en'],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    electionType: 'Federal Parliamentary Democracy',
    votingAge: 18,
    electionBody: 'Australian Electoral Commission',
    electionBodyUrl: 'https://www.aec.gov.au',
    languages: ['en'],
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    electionType: 'Absolute Monarchy (Municipal Elections)',
    votingAge: 18,
    electionBody: 'Ministry of Municipal and Rural Affairs',
    electionBodyUrl: 'https://www.momra.gov.sa',
    languages: ['ar', 'en'],
  },
];

/**
 * Retrieves a country by its ISO 3166-1 alpha-2 code.
 * @param code - Two-letter country code (e.g. 'IN', 'US')
 * @returns Country object or undefined if not found
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

/**
 * Returns all supported country codes.
 * @returns Array of two-letter country codes
 */
export function getAllCountryCodes(): string[] {
  return COUNTRIES.map((c) => c.code);
}
