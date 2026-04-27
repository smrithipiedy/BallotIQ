/**
 * Lightweight intent detection engine.
 * Maps user queries to specific election topics without using AI tokens.
 */

export type AssistantIntent =
  | 'voter_registration'
  | 'voting_process'
  | 'id_requirements'
  | 'election_dates'
  | 'results_counting'
  | 'eligibility'
  | 'unknown';

const INTENT_KEYWORDS: Record<AssistantIntent, string[]> = {
  voter_registration: ['register', 'registration', 'enroll', 'form 6', 'sign up', 'list', 'electoral roll'],
  voting_process: ['how to vote', 'evm', 'machine', 'ballot', 'booth', 'polling station', 'vvpat'],
  id_requirements: ['id', 'identification', 'document', 'passport', 'proof', 'aadhaar', 'voter card', 'epic'],
  election_dates: ['when', 'date', 'timeline', 'schedule', 'deadline', 'polling day'],
  results_counting: ['count', 'results', 'who won', 'winner', 'counting'],
  eligibility: ['eligible', 'can i vote', 'age', 'citizen', 'requirements'],
  unknown: [],
};

/**
 * Detects the primary intent of a user's message.
 */
export function detectIntent(message: string): AssistantIntent {
  const text = message.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'unknown') continue;
    if (keywords.some(kw => text.includes(kw))) {
      return intent as AssistantIntent;
    }
  }

  return 'unknown';
}
