'use client';

/**
 * Hook managing the 3-question diagnostic assessment flow.
 * Collects answers, calls Gemini for analysis, and builds UserContext.
 */

import { useState, useCallback } from 'react';
import type { AssessmentAnswer, AssessmentPhase, KnowledgeLevel, UserContext } from '@/types';
import { analyzeAssessment } from '@/lib/gemini/client';
import { analyzeAssessmentLocally } from '@/lib/assessment/analyzer';
import { saveUserContext } from '@/lib/firebase/firestore';
import { authReady } from '@/lib/firebase/client';
import { logAssessmentComplete } from '@/lib/firebase/analytics';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import { getCountryByCode } from '@/lib/constants/countries';

interface UseAssessmentReturn {
  phase: AssessmentPhase;
  currentQuestion: number;
  answers: Partial<AssessmentAnswer>;
  isAnalyzing: boolean;
  userContext: UserContext | null;
  answerQuestion: (answer: boolean | number | string) => void;
  goBack: () => void;
}

/**
 * Manages the diagnostic assessment flow.
 * @param countryCode - Selected country code
 * @param countryName - Selected country name
 * @param sessionId - Current session identifier
 * @returns Assessment state and controls
 */
export function useAssessment(
  countryCode: string,
  countryName: string,
  sessionId: string
): UseAssessmentReturn {
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswer>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  /** Processes the user's answer and advances to the next question or phase. */
  const answerQuestion = useCallback(async (answer: boolean | number | string) => {
    const updated = { ...answers };
    const countryData = getCountryByCode(countryCode);

    if (currentQuestion === 0) {
      updated.hasVotedBefore = answer as boolean;
      setAnswers(updated);
      setCurrentQuestion(1);
      if (phase === 'intro') setPhase('questions');
    } else if (currentQuestion === 1) {
      updated.selfRatedKnowledge = answer as number;
      setAnswers(updated);
      setCurrentQuestion(2);
    } else if (currentQuestion === 2) {
      updated.mainConfusion = sanitizeUserInput(answer as string);
      setAnswers(updated);
      setPhase('analyzing');
      setIsAnalyzing(true);

      try {
        const complete: AssessmentAnswer = {
          hasVotedBefore: updated.hasVotedBefore ?? false,
          selfRatedKnowledge: updated.selfRatedKnowledge ?? 3,
          mainConfusion: updated.mainConfusion ?? '',
        };

        // Get local analysis first (Instant)
        const localResult = analyzeAssessmentLocally(complete);

        // Try AI analysis in parallel
        let finalLevel = localResult.knowledgeLevel;
        let finalStepCount = localResult.recommendedStepCount;
        try {
          const aiResult = await analyzeAssessment(complete, countryCode, countryName);
          finalLevel = aiResult.knowledgeLevel;
          finalStepCount = aiResult.recommendedStepCount;
        } catch {
          console.warn('[Assessment] AI analysis failed, using local result');
        }

        const ctx: UserContext = {
          sessionId,
          countryCode,
          countryName,
          hasVotedBefore: complete.hasVotedBefore,
          selfRatedKnowledge: complete.selfRatedKnowledge,
          mainConfusion: complete.mainConfusion,
          knowledgeLevel: finalLevel,
          recommendedStepCount: finalStepCount,
          language: 'en',
          adaptationActive: false,
          consecutiveErrors: 0,
          electionBody: countryData?.electionBody,
          electionBodyUrl: countryData?.electionBodyUrl,
        };

        await authReady;
        await saveUserContext(ctx);
        await logAssessmentComplete(finalLevel, countryCode);
        setUserContext(ctx);
        setPhase('complete');
      } catch (error) {
        console.error('[Assessment] Analysis failed:', error);
        const fallbackLevel: KnowledgeLevel = (updated.selfRatedKnowledge ?? 3) <= 2 ? 'beginner' : 'intermediate';
        const ctx: UserContext = {
          sessionId, countryCode, countryName,
          hasVotedBefore: updated.hasVotedBefore ?? false,
          selfRatedKnowledge: updated.selfRatedKnowledge ?? 3,
          mainConfusion: updated.mainConfusion ?? '',
          knowledgeLevel: fallbackLevel,
          language: 'en', adaptationActive: false, consecutiveErrors: 0,
          electionBody: countryData?.electionBody,
          electionBodyUrl: countryData?.electionBodyUrl,
        };
        setUserContext(ctx);
        setPhase('complete');
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [answers, currentQuestion, phase, countryCode, countryName, sessionId]);

  /** Returns to the previous question in the assessment sequence. */
  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  return { phase, currentQuestion, answers, isAnalyzing, userContext, answerQuestion, goBack };
}
