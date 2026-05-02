import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDB, authReady } from '../client';
import { withTrace } from '../performance';
import { logger } from '@/lib/logger';
import type { ElectionStep, KnowledgeLevel, QuizQuestion, CacheEntry } from '@/types';

/**
 * Caches an election guide in Firestore with 24h TTL.
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
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
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
  } catch {
    return null;
  }
}
