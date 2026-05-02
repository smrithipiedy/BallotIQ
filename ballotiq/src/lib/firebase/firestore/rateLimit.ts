import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDB, authReady } from '../client';
import type { RateLimitState } from '@/types';

/**
 * Saves rate limit state to Firestore.
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
