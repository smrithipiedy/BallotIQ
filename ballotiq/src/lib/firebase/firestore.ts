/**
 * All Firestore database operations for BallotIQ.
 * Uses client SDK only (no Admin SDK — static export).
 * All writes require authenticated user (anonymous auth).
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { getFirestoreDB, authReady } from './client';
import { withTrace } from './performance';
import { logger } from '@/lib/logger';
import type {
  UserContext,
  ElectionStep,
  KnowledgeLevel,
  UserProgress,
  ChatMessage,
  RateLimitState,
  CacheEntry,
  QuizQuestion,
} from '@/types';

/**
 * Saves or updates user session context in Firestore.
 * @param context - UserContext to persist
 */
export async function saveUserContext(context: UserContext): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', context.sessionId, 'context', 'current');
    await setDoc(ref, context, { merge: true });
  } catch (error) {
    logger.error('[Firestore] Failed to save user context:', error, { component: 'Firestore' });
  }
}

/**
 * Retrieves user session context from Firestore.
 * @param sessionId - Session identifier
 * @returns UserContext or null if not found
 */
export async function getUserContext(sessionId: string): Promise<UserContext | null> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', sessionId, 'context', 'current');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserContext) : null;
  } catch (error) {
    logger.error('[Firestore] Failed to get user context:', error, { component: 'Firestore' });
    return null;
  }
}

/**
 * Caches an election guide in Firestore with 24h TTL.
 * @param countryCode - ISO country code
 * @param knowledgeLevel - User's knowledge level
 * @param steps - Election steps to cache
 */
export async function cacheElectionGuide(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel,
  steps: ElectionStep[]
): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const cacheKey = `${countryCode}_${knowledgeLevel}`;
    const ref = doc(db, 'guides_cache', cacheKey);
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const entry: CacheEntry<ElectionStep[]> = {
      data: steps,
      cachedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    await setDoc(ref, entry);
  } catch (error) {
    logger.error('[Firestore] Failed to cache election guide:', error, { component: 'Firestore' });
  }
}

/**
 * Retrieves a cached election guide from Firestore.
 * Returns null if cache is expired or missing.
 * @param countryCode - ISO country code
 * @param knowledgeLevel - User's knowledge level
 * @returns Cached ElectionStep array or null
 */
export async function getCachedGuide(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel
): Promise<ElectionStep[] | null> {
  return withTrace(
    'firestore_cache_read',
    { countryCode, knowledgeLevel },
    async () => {
      try {
        await authReady;
        const db = getFirestoreDB();
        const cacheKey = `${countryCode}_${knowledgeLevel}`;
        const ref = doc(db, 'guides_cache', cacheKey);
        const snap = await getDoc(ref);

        if (!snap.exists()) return null;

        const entry = snap.data() as CacheEntry<ElectionStep[]>;
        const now = new Date();
        const expires = new Date(entry.expiresAt);

        if (now > expires) return null;

        return entry.data;
      } catch (error) {
        console.error('[Firestore] Failed to get cached guide:', error);
        return null;
      }
    }
  );
}

/**
 * Saves or updates user learning progress.
 * Merges with existing data to preserve previous state.
 * @param progress - UserProgress to persist
 */
export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', progress.sessionId, 'progress', 'current');
    await setDoc(ref, { ...progress, lastUpdated: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save progress:', error);
  }
}

/**
 * Retrieves user learning progress from Firestore.
 * @param sessionId - Session identifier
 * @returns UserProgress or null if not found
 */
export async function getProgress(sessionId: string): Promise<UserProgress | null> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', sessionId, 'progress', 'current');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProgress) : null;
  } catch (error) {
    console.error('[Firestore] Failed to get progress:', error);
    return null;
  }
}

/**
 * Appends a chat message to the session's message history.
 * 
 * @param sessionId - The unique identifier for the user session
 * @param message - The chat message object to save
 */
export async function saveChatMessage(sessionId: string, message: ChatMessage): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = collection(db, 'sessions', sessionId, 'messages');
    await addDoc(ref, message);
  } catch (error) {
    console.warn('[Firestore] Failed to save chat message:', error);
  }
}

/**
 * Retrieves the last 20 chat messages for a session.
 * @param sessionId - Session identifier
 * @returns Array of ChatMessage objects ordered by timestamp
 */
export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const messagesRef = collection(db, 'sessions', sessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ChatMessage);
  } catch (error) {
    console.error('[Firestore] Failed to get chat history:', error);
    return [];
  }
}

/**
 * Saves rate limit state to Firestore.
 * @param state - RateLimitState to persist
 */
export async function saveRateLimitState(state: RateLimitState): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'rate_limits', state.sessionId);
    await setDoc(ref, state, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save rate limit state:', error);
  }
}

/**
 * Retrieves rate limit state from Firestore.
 * @param sessionId - Session identifier
 * @returns RateLimitState or null if not found
 */
export async function getRateLimitState(
  sessionId: string
): Promise<RateLimitState | null> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'rate_limits', sessionId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as RateLimitState) : null;
  } catch (error) {
    console.error('[Firestore] Failed to get rate limit state:', error);
    return null;
  }
}
/**
 * Caches a personalized quiz in Firestore.
 */
export async function cacheQuiz(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel,
  questions: QuizQuestion[]
): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const cacheKey = `quiz_${countryCode}_${knowledgeLevel}`;
    const ref = doc(db, 'quizzes_cache', cacheKey);
    const entry: CacheEntry<QuizQuestion[]> = {
      data: questions,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12h TTL
    };
    await setDoc(ref, entry);
  } catch (error) {
    console.error('[Firestore] Failed to cache quiz:', error);
  }
}

/**
 * Retrieves a cached quiz from Firestore.
 */
export async function getCachedQuiz(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel
): Promise<QuizQuestion[] | null> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const cacheKey = `quiz_${countryCode}_${knowledgeLevel}`;
    const ref = doc(db, 'quizzes_cache', cacheKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const entry = snap.data() as CacheEntry<QuizQuestion[]>;
    if (new Date() > new Date(entry.expiresAt)) return null;
    return entry.data;
  } catch (error) {
    console.error('[Firestore] Failed to get cached quiz:', error);
    return null;
  }
}
