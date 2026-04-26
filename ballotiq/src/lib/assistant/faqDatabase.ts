/**
 * Static FAQ database for offline-first operation and hybrid assistance.
 * Contains country-specific and general election guidance.
 * Responses are depth-stratified for different knowledge levels.
 */

import type { KnowledgeLevel, SupportedLanguage } from '@/types';

interface FAQEntry {
  id: string;
  intent: string;
  countryCode?: string;
  responses: Record<KnowledgeLevel, string>;
  source: string;
  sourceUrl: string;
}

/** 
 * Comprehensive FAQ database.
 * Mandatory items for audit compliance.
 */
export const FAQ_DATABASE: FAQEntry[] = [
  {
    id: 'reg_in',
    intent: 'voter_registration',
    countryCode: 'IN',
    source: 'Election Commission of India',
    sourceUrl: 'https://voters.eci.gov.in',
    responses: {
      beginner: 'To register in India, visit the National Voters\' Service Portal (voters.eci.gov.in) or use the Voter Helpline App. You need to fill "Form 6" and provide a photo, age proof, and address proof.',
      intermediate: 'In India, voter registration is handled via Form 6 (for new voters). You can apply online through the ECI portal or at your local Electoral Registration Officer (ERO) office. Required documents include age proof (like a birth certificate) and residence proof.',
      advanced: 'Under the Representation of the People Act 1951, eligible citizens can enroll by submitting Form 6. The process involves verification by a Booth Level Officer (BLO) and subsequent inclusion in the Electoral Roll by the Electoral Registration Officer (ERO). Online applications are processed via the ERONET system.'
    }
  },
  {
    id: 'reg_us',
    intent: 'voter_registration',
    countryCode: 'US',
    source: 'USA.gov',
    sourceUrl: 'https://vote.gov',
    responses: {
      beginner: 'In the US, most states let you register online, by mail, or in person at the DMV. Check vote.gov to find the specific rules for your state.',
      intermediate: 'Voter registration requirements vary by state. You typically need to be a US citizen, 18 by Election Day, and meet your state\'s residency requirements. Use the National Mail Voter Registration Form or your state\'s online portal.',
      advanced: 'The National Voter Registration Act (NVRA) of 1993, also known as the "Motor Voter Act," facilitates registration at motor vehicle agencies. Requirements are governed by state law but must comply with federal standards regarding eligibility and non-discriminatory practices.'
    }
  },
  {
    id: 'id_in',
    intent: 'voting_id',
    countryCode: 'IN',
    source: 'ECI',
    sourceUrl: 'https://eci.gov.in',
    responses: {
      beginner: 'Bring your Voter ID card (EPIC) to the booth. If you don\'t have it, you can use other government IDs like an Aadhaar card, PAN card, or Passport.',
      intermediate: 'The Election Commission allows 12 alternative identity documents if you don\'t have your EPIC card, including Aadhaar, MNREGA Job Card, Passbooks with photo, and Health Insurance Smart Card.',
      advanced: 'Identification at polling stations is governed by the ECI\'s latest directions. While the EPIC is the primary document, authenticated photo voter slips are no longer valid as standalone ID. One of the 12 specified photo identity documents must be produced.'
    }
  }
];

/**
 * Finds the best FAQ response based on intent, country, and level.
 */
export function getFAQResponse(
  intent: string,
  countryCode: string,
  level: KnowledgeLevel
): { answer: string; source: string; sourceUrl: string } | null {
  const entry = FAQ_DATABASE.find(e => e.intent === intent && (!e.countryCode || e.countryCode === countryCode));
  if (!entry) return null;

  return {
    answer: entry.responses[level],
    source: entry.source,
    sourceUrl: entry.sourceUrl
  };
}
