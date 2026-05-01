/**
 * BallotIQ — Core TypeScript interfaces and type definitions.
 * All types used across the application are centralized here.
 */

/** User's assessed knowledge level */
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

/** Status of an election learning step */
export type ElectionStepStatus = 'locked' | 'upcoming' | 'current' | 'completed';

/** Difficulty tier for quiz questions */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/** Languages supported by BallotIQ */
export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'fr' | 'es' | 'de' | 'ar';

/** Source of learning content */
export type LearningSource = 'gemini' | 'cache' | 'fallback';

/** Phase of the assessment flow */
export type AssessmentPhase = 'intro' | 'questions' | 'analyzing' | 'complete';

/** Phase of the final quiz flow */
export type QuizPhase = 'loading' | 'active' | 'reviewing' | 'complete';

/** Reason the adaptive system triggered simplified mode */
export type AdaptationReason = 'consecutive_errors' | 'low_score' | 'user_request' | 'user_consent';

/** Country metadata for election education */
export interface Country {
  code: string;
  name: string;
  flag: string;
  electionType: string;
  votingAge: number;
  electionBody: string;
  electionBodyUrl: string;
  languages: SupportedLanguage[];
}

/** User session context used to personalize all AI interactions */
export interface UserContext {
  sessionId: string;
  countryCode: string;
  countryName: string;
  hasVotedBefore: boolean | null;
  selfRatedKnowledge: number;
  mainConfusion: string;
  knowledgeLevel: KnowledgeLevel;
  language: SupportedLanguage;
  adaptationActive: boolean;
  consecutiveErrors: number;
  recommendedStepCount?: number;
  electionBody?: string;
  electionBodyUrl?: string;
}

/** A single step in the election learning path */
export interface ElectionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  detailedExplanation: string;
  simpleExplanation: string;
  timeline: string;
  requirements: string[];
  tips: string[];
  status: ElectionStepStatus;
  microQuizQuestion?: MicroQuizQuestion;
}

/** Post-step comprehension check question */
export interface MicroQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

/** Complete election guide for a country and knowledge level */
export interface ElectionGuide {
  country: Country;
  steps: ElectionStep[];
  personalizedFor: KnowledgeLevel;
  generatedAt: string;
  source: LearningSource;
}

/** A single message in the assistant chat */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  officialSource?: { name: string; url: string };
}

/** A question in the final certification quiz */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  relatedStepId: string;
}

/** Result of a single quiz question attempt */
export interface QuizResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeTakenSeconds: number;
  geminiExplanation?: string;
}

/** Persisted user learning progress */
export interface UserProgress {
  sessionId: string;
  countryCode: string;
  completedSteps: string[];
  microQuizResults: Record<string, boolean>;
  quizScore?: number;
  knowledgeLevel: KnowledgeLevel;
  language: SupportedLanguage;
  adaptationActive: boolean;
  lastUpdated: string;
}

/** Answers collected during the diagnostic assessment */
export interface AssessmentAnswer {
  hasVotedBefore: boolean;
  selfRatedKnowledge: number;
  mainConfusion: string;
}

/** Rate limit tracking state per session */
export interface RateLimitState {
  sessionId: string;
  geminiCallsToday: number;
  translateCallsToday: number;
  ttsCallsToday: number;
  lastReset: string;
}

/** Generic cache entry with TTL */
export interface CacheEntry<T> {
  data: T;
  cachedAt: string;
  expiresAt: string;
}
