import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirestoreDB, authReady } from '../client';
import { logger } from '@/lib/logger';
import type { UserContext, UserProgress, ChatMessage } from '@/types';

/**
 * Saves or updates user session context in Firestore.
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
 * Saves or updates user learning progress.
 */
export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', progress.sessionId, 'progress', 'current');
    await setDoc(ref, { ...progress, lastUpdated: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn('[Firestore] Failed to save progress:', error);
  }
}

/**
 * Retrieves user learning progress from Firestore.
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
 * Saves a chat message to Firestore for session history.
 */
export async function saveChatMessage(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  try {
    await authReady;
    const db = getFirestoreDB();
    const ref = doc(db, 'sessions', sessionId, 'messages', message.id);
    await setDoc(ref, message);
  } catch (error) {
    console.warn('[Firestore] Failed to save chat message:', error);
  }
}

/**
 * Retrieves the last 20 chat messages for a session.
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
