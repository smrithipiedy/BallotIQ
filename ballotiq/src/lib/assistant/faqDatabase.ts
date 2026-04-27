/**
 * Static FAQ database for election topics.
 * Provides depth-stratified answers and official sources.
 */

import type { KnowledgeLevel } from '@/types';
import type { AssistantIntent } from './intentEngine';

interface FAQResponse {
  answer: string;
  sourceName: string;
  sourceUrl: string;
  followUps: string[];
}

const FAQ_DATA: Record<string, Partial<Record<AssistantIntent, Record<KnowledgeLevel, FAQResponse>>>> = {
  IN: {
    voter_registration: {
      beginner: {
        answer: "To register as a new voter in India, you need to fill out Form 6. You can do this easily online through the National Voters' Service Portal (NVSP) or using the Voter Helpline App. You'll need a photo, proof of age (like Aadhaar), and proof of address.",
        sourceName: "Election Commission of India",
        sourceUrl: "https://voters.eci.gov.in",
        followUps: ["What documents do I need?", "How long does it take?", "Can I register offline?"],
      },
      intermediate: {
        answer: "Voter registration is handled via Form 6 for new electors. Once submitted online via NVSP, a Booth Level Officer (BLO) may visit your residence for physical verification. You can track your 'Form 6' status using the reference ID provided after submission.",
        sourceName: "ECI Voter Portal",
        sourceUrl: "https://voters.eci.gov.in",
        followUps: ["Who is my BLO?", "Form 6 status track", "Correction of details"],
      },
      advanced: {
        answer: "Under the Representation of the People Act, registration is mandatory for eligibility. Form 6 is used for new registrations, while Form 8 handles shifts or corrections. The Electoral Registration Officer (ERO) oversees the inclusion in the roll after statutory verification procedures.",
        sourceName: "ECI Legal Framework",
        sourceUrl: "https://eci.gov.in",
        followUps: ["Section 62 of RPA 1951", "Form 7 for deletions", "Electoral roll revision schedule"],
      },
    },
    voting_process: {
      beginner: {
        answer: "When you go to vote, you'll use an Electronic Voting Machine (EVM). Just press the blue button next to your candidate's symbol. You'll hear a beep and see a slip in the VVPAT window for 7 seconds to confirm your vote.",
        sourceName: "ECI EVM Guide",
        sourceUrl: "https://eci.gov.in/evm/",
        followUps: ["What is VVPAT?", "Is my vote secret?", "What if the machine fails?"],
      },
      intermediate: {
        answer: "India's EVM system consists of a Control Unit and a Balloting Unit. The VVPAT (Voter Verifiable Paper Audit Trail) prints a slip showing your choice. These machines are battery-operated and standalone, meaning they have no internet or network connectivity.",
        sourceName: "ECI Technical FAQ",
        sourceUrl: "https://eci.gov.in/evm/",
        followUps: ["EVM security features", "VVPAT counting rules", "Mock poll process"],
      },
      advanced: {
        answer: "The integrity of the voting process is maintained via M3 generation EVMs and VVPATs. Under ECI guidelines, a mandatory verification of VVPAT slips from 5 randomly selected polling stations per assembly constituency is conducted to ensure 100% tally accuracy.",
        sourceName: "ECI Systematic Voters' Education",
        sourceUrl: "https://eci.gov.in",
        followUps: ["VVPAT audit trail laws", "Machine randomization process", "Candidate agent verification"],
      },
    },
    // ... add more intents as needed, defaulting to beginner for now
  },
  US: {
    voter_registration: {
      beginner: {
        answer: "In the US, most states require you to register to vote before election day. You can usually do this online, by mail, or at the DMV. Check vote.gov to see the specific rules and deadlines for your state.",
        sourceName: "Official US Government Portal",
        sourceUrl: "https://vote.gov",
        followUps: ["Registration deadlines", "Am I already registered?", "Same-day registration"],
      },
      intermediate: {
        answer: "Registration requirements vary by state. While most states have deadlines 15-30 days before an election, some offer 'Same Day Registration'. You typically need a state-issued ID or the last 4 digits of your Social Security Number.",
        sourceName: "Vote.gov State Search",
        sourceUrl: "https://vote.gov",
        followUps: ["National Mail Registration Form", "Automatic registration states", "ID requirements"],
      },
      advanced: {
        answer: "Voter registration is governed by the National Voter Registration Act (NVRA) of 1993, also known as the 'Motor Voter' law. It requires states to offer registration at DMVs and via mail, though states like North Dakota remain exempt from registration requirements entirely.",
        sourceName: "FEC Registration Laws",
        sourceUrl: "https://www.fec.gov",
        followUps: ["NVRA Section 5", "Help America Vote Act (HAVA)", "Voter list maintenance rules"],
      },
    },
  },
};

/**
 * Retrieves a static FAQ response based on country, intent, and knowledge level.
 */
export function getFAQResponse(
  countryCode: string,
  intent: AssistantIntent,
  knowledgeLevel: KnowledgeLevel
): FAQResponse | null {
  const countryData = FAQ_DATA[countryCode] || FAQ_DATA.US; // Fallback to US
  const intentData = countryData[intent];
  
  if (!intentData) return null;
  return intentData[knowledgeLevel];
}
