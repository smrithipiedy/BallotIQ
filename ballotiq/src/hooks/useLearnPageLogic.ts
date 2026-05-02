'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { UserContext } from '@/types';
import { getCountryByCode } from '@/lib/constants/countries';
import { useTTS } from '@/hooks/useTTS';
import { useProgress } from '@/hooks/useProgress';
import { useElectionGuide } from '@/hooks/useElectionGuide';
import { useMicroQuiz } from '@/hooks/useMicroQuiz';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useProactiveAssistant } from '@/hooks/useProactiveAssistant';

/**
 * Custom hook to manage the complex state and data orchestration for the learning page.
 * Handles user context, guide fetching, progress tracking, adaptive learning, and assistant integration.
 */
export function useLearnPageLogic() {
  const router = useRouter();
  const params = useParams();
  const countryCode = (params.country as string) || 'IN';
  
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_context');
    if (!stored) return null;
    const ctx = JSON.parse(stored) as UserContext;
    
    // Hydrate missing metadata for legacy sessions
    if (!ctx.electionBody || !ctx.electionBodyUrl) {
      const countryData = getCountryByCode(ctx.countryCode);
      if (countryData) {
        ctx.electionBody = countryData.electionBody;
        ctx.electionBodyUrl = countryData.electionBodyUrl;
        sessionStorage.setItem('ballotiq_context', JSON.stringify(ctx));
      }
    }
    return ctx;
  });

  useEffect(() => {
    if (!userContext) router.push('/');
  }, [router, userContext]);

  const country = useMemo(() => getCountryByCode(countryCode), [countryCode]);

  // Data fetching
  const { steps, loading: guideLoading } = useElectionGuide(countryCode, userContext);
  
  // Progress tracking
  const { completeStep, completedSteps, saveMicroQuizResult } = useProgress(
    countryCode, 
    userContext?.knowledgeLevel || 'beginner'
  );

  // Adaptive learning core
  const { 
    currentStepIndex, setCurrentStepIndex,
    adaptationActive, reExplanation, isReExplaining,
    consecutiveErrors,
    handleMicroQuizResult: handleAdaptiveResult,
    confirmAdaptation,
    moveToNextStep
  } = useAdaptiveLearning(userContext, steps, completedSteps);

  // Proactive Assistant logic
  const { suggestion, dismiss, recordInteraction } = useProactiveAssistant({
    userContext,
    currentStepIndex,
    consecutiveErrors,
    completedStepsCount: completedSteps.length,
    onSuggestSimplification: () => {
      confirmAdaptation();
    }
  });

  const activeStep = steps[currentStepIndex] || null;

  // Micro-quiz logic
  const { 
    question, selectedAnswer, isCorrect, showResult, 
    explanation, loading: quizLoading, submitAnswer, reset: resetQuiz 
  } = useMicroQuiz(activeStep, userContext, ({ correct, selectedAnswerText, correctAnswerText }) => {
    if (!activeStep) return;

    saveMicroQuizResult(activeStep.id, correct);
    handleAdaptiveResult(correct, activeStep, selectedAnswerText, correctAnswerText);
  });

  // TTS support
  const { isSpeaking, currentText, toggle: toggleTTS, stop: stopTTS } = useTTS(
    userContext?.sessionId || ''
  );

  const handleStepClick = (index: number) => {
    stopTTS();
    resetQuiz();
    setCurrentStepIndex(index);
    recordInteraction();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    router,
    countryCode,
    userContext,
    country,
    steps,
    guideLoading,
    completedSteps,
    currentStepIndex,
    setCurrentStepIndex,
    activeStep,
    adaptationActive,
    reExplanation,
    isReExplaining,
    suggestion,
    dismiss,
    recordInteraction,
    question,
    quizLoading,
    selectedAnswer,
    isCorrect,
    showResult,
    explanation,
    submitAnswer,
    resetQuiz,
    toggleTTS,
    isSpeaking,
    currentText,
    handleStepClick,
    moveToNextStep,
    completeStep,
  };
}
