/**
 * Simple rule-based intent engine for mapping user queries to FAQ intents.
 * Ensures the assistant works reliably even without Gemini.
 */

interface IntentMapping {
  intent: string;
  keywords: string[];
}

const MAPPINGS: IntentMapping[] = [
  {
    intent: 'voter_registration',
    keywords: ['register', 'registration', 'enroll', 'enrol', 'sign up', 'form 6']
  },
  {
    intent: 'voting_id',
    keywords: ['id', 'identity', 'card', 'epic', 'document', 'aadhaar', 'passport']
  },
  {
    intent: 'polling_station',
    keywords: ['where', 'location', 'station', 'booth', 'place', 'nearby']
  },
  {
    intent: 'dates',
    keywords: ['when', 'date', 'deadline', 'time', 'schedule']
  }
];

/**
 * Detects the user's intent from their query text.
 * @param text - User's input message
 * @returns Intent string or 'unknown'
 */
export function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  
  for (const mapping of MAPPINGS) {
    if (mapping.keywords.some(k => lower.includes(k))) {
      return mapping.intent;
    }
  }

  return 'unknown';
}
