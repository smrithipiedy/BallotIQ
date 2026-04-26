'use client';

/**
 * Hook for fetching adaptive election content with three-tier fallback.
 * Optimized for <1s initial load by serving fallback content immediately.
 */

import { useState, useEffect, useRef } from 'react';
import type { ElectionStep, LearningSource, UserContext } from '@/types';
import { generatePersonalizedGuide } from '@/lib/gemini/operations';
import { getFallbackGuide } from '@/lib/gemini/fallback';

interface UseElectionGuideReturn {
  steps: ElectionStep[];
  loading: boolean;
  error: string | null;
  source: LearningSource;
  personalizedFor: string;
}

/**
 * Fetches and manages the personalized election guide.
 * @param countryCode - ISO country code
 * @param userContext - User's session context with knowledge level and confusion
 * @returns Steps, loading state, error, and content source
 */
export function useElectionGuide(
  countryCode: string,
  userContext: UserContext | null,
): UseElectionGuideReturn {
  const [steps, setSteps] = useState<ElectionStep[]>(() => {
    if (!countryCode || !userContext) return [];
    const initialFallback = getFallbackGuide(countryCode, userContext.knowledgeLevel);
    return initialFallback?.map((s, i) => ({
      ...s,
      status: i === 0 ? 'current' as const : 'locked' as const,
    })) ?? [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LearningSource>(() => {
    return (countryCode && userContext) ? 'fallback' : 'fallback';
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (countryCode && userContext && steps.length === 0 && source === 'fallback') {
      const fallback = getFallbackGuide(countryCode, userContext.knowledgeLevel);
      if (fallback) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSteps(fallback.map((s, i) => ({
          ...s,
          status: i === 0 ? 'current' as const : 'locked' as const,
        })));
      }
    }
  }, [countryCode, userContext, steps.length, source]);

  useEffect(() => {
    if (!userContext || !countryCode || fetchedRef.current) return;
    
    fetchedRef.current = true;

    let didTimeout = false;

    async function loadGuide() {
      setLoading(true);
      setError(null);

      // 800ms timeout for initial load to guarantee <1s display
      const timeoutId = setTimeout(() => {
        if (!didTimeout) {
          didTimeout = true;
          console.info('[ElectionGuide] Fast-rendering fallback while AI generates in background...');
          setLoading(false);
        }
      }, 800);

      try {
        const result = await generatePersonalizedGuide(
          countryCode,
          userContext!.countryName,
          userContext!.knowledgeLevel,
          [userContext!.mainConfusion || 'general election process'],
          userContext!.mainConfusion || '',
          userContext!.sessionId,
        );

        clearTimeout(timeoutId);

        // Update with personalized content (even if timeout already fired and fallback is showing)
        if (result.source === 'gemini' || result.source === 'cache') {
          const stepsWithStatus = result.steps.map((s, i) => ({
            ...s,
            status: i === 0 ? 'current' as const : 'locked' as const,
          }));

          setSteps(stepsWithStatus);
          setSource(result.source);
        }
      } catch (err) {
        if (didTimeout) return;
        clearTimeout(timeoutId);
        console.error('[ElectionGuide] AI fetch failed, using already loaded fallback:', err);
      } finally {
        if (!didTimeout) setLoading(false);
      }
    }

    loadGuide();
  }, [countryCode, userContext]);

  return {
    steps,
    loading,
    error,
    source,
    personalizedFor: userContext?.knowledgeLevel ?? 'beginner',
  };
}
