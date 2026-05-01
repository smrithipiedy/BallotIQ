'use client';

/**
 * Hook for persisting and restoring user learning progress.
 * Uses the Firebase anonymous auth UID as the session ID
 * so Firestore rules can enforce ownership.
 */

import { useState, useEffect, useCallback } from 'react';
import type { KnowledgeLevel, SupportedLanguage, UserProgress } from '@/types';
import { saveProgress, getProgress } from '@/lib/firebase/firestore';
import { authReady, getFirebaseAuth } from '@/lib/firebase/client';

/** localStorage key for session ID */
const SESSION_KEY = 'ballotiq_session_id';

/**
 * Returns the Firebase anonymous auth UID, falling back to a stored UUID.
 * The auth UID is preferred because Firestore rules enforce `auth.uid == sessionId`.
 * @returns Session ID string
 */
function getOrCreateSessionId(): string {
  const auth = getFirebaseAuth();
  if (auth.currentUser?.uid) {
    // Persist so it survives before auth is ready on next page load
    localStorage.setItem(SESSION_KEY, auth.currentUser.uid);
    return auth.currentUser.uid;
  }
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  // Temporary fallback until auth resolves — will be overwritten
  const temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  localStorage.setItem(SESSION_KEY, temp);
  return temp;
}

interface UseProgressReturn {
  progress: UserProgress | null;
  sessionId: string;
  completeStep: (stepId: string) => void;
  completedSteps: string[];
  isStepComplete: (stepId: string) => boolean;
  saveMicroQuizResult: (stepId: string, correct: boolean) => void;
  saveQuizScore: (score: number) => void;
  updateLanguage: (lang: SupportedLanguage) => void;
  resetProgress: () => void;
}

/**
 * Manages user learning progress with Firestore persistence.
 * Session ID is derived from the Firebase anonymous auth UID.
 * @param countryCode - Current country being studied
 * @param knowledgeLevel - User's knowledge level
 * @returns Progress state and mutation functions
 */
export function useProgress(
  countryCode: string,
  knowledgeLevel: KnowledgeLevel
): UseProgressReturn {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return getOrCreateSessionId();
  });
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Once auth is ready, upgrade to the real Firebase UID
  useEffect(() => {
    let cancelled = false;
    authReady.then(() => {
      if (cancelled) return;
      const auth = getFirebaseAuth();
      if (auth.currentUser?.uid) {
        const uid = auth.currentUser.uid;
        localStorage.setItem(SESSION_KEY, uid);
        setSessionId(uid);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Restore progress on mount
  useEffect(() => {
    async function restore() {
      try {
        await authReady;
        const saved = await getProgress(sessionId);
        if (saved && saved.countryCode === countryCode && saved.knowledgeLevel === knowledgeLevel) {
          setProgress(saved);
        } else {
          const initial: UserProgress = {
            sessionId, countryCode, completedSteps: [],
            microQuizResults: {}, knowledgeLevel,
            language: 'en', adaptationActive: false,
            lastUpdated: new Date().toISOString(),
          };
          setProgress(initial);
        }
      } catch {
        setProgress({
          sessionId, countryCode, completedSteps: [],
          microQuizResults: {}, knowledgeLevel,
          language: 'en', adaptationActive: false,
          lastUpdated: new Date().toISOString(),
        });
      }
    }
    if (!sessionId) return;
    restore();
  }, [sessionId, countryCode, knowledgeLevel]);

  const persist = useCallback(async (updated: UserProgress) => {
    setProgress(updated);
    try { 
      await authReady;
      await saveProgress(updated); 
    } catch { /* non-critical */ }
  }, []);

  const completeStep = useCallback((stepId: string) => {
    if (!progress) return;
    if (progress.completedSteps.includes(stepId)) return;
    const updated: UserProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps, stepId],
      lastUpdated: new Date().toISOString(),
    };
    persist(updated);
  }, [progress, persist]);

  const saveMicroQuizResult = useCallback((stepId: string, correct: boolean) => {
    if (!progress) return;
    const updated: UserProgress = {
      ...progress,
      microQuizResults: { ...progress.microQuizResults, [stepId]: correct },
      lastUpdated: new Date().toISOString(),
    };
    persist(updated);
  }, [progress, persist]);

  const saveQuizScore = useCallback((score: number) => {
    if (!progress) return;
    persist({ ...progress, quizScore: score, lastUpdated: new Date().toISOString() });
  }, [progress, persist]);

  const updateLanguage = useCallback((lang: SupportedLanguage) => {
    if (!progress) return;
    persist({ ...progress, language: lang, lastUpdated: new Date().toISOString() });
  }, [progress, persist]);

  const resetProgress = useCallback(() => {
    const initial: UserProgress = {
      sessionId, countryCode, completedSteps: [],
      microQuizResults: {}, knowledgeLevel,
      language: 'en', adaptationActive: false,
      lastUpdated: new Date().toISOString(),
    };
    persist(initial);
  }, [sessionId, countryCode, knowledgeLevel, persist]);

  return {
    progress, sessionId,
    completeStep,
    completedSteps: progress?.completedSteps ?? [],
    isStepComplete: (stepId: string) => progress?.completedSteps.includes(stepId) ?? false,
    saveMicroQuizResult, saveQuizScore, updateLanguage, resetProgress,
  };
}
