'use client';

/**
 * THE CORE INTELLIGENCE HOOK.
 * Tracks consecutive errors and triggers adaptation mode
 * when a user struggles with micro-quiz questions.
 */

import { useState, useCallback } from 'react';
import type { ElectionStep, UserContext } from '@/types';
import { reExplainConcept } from '@/lib/gemini/operations';
import { saveUserContext } from '@/lib/firebase/firestore';
import { logAdaptationTriggered } from '@/lib/firebase/analytics';

/** Consecutive wrong answers before adaptation triggers */
const ADAPTATION_THRESHOLD = 2;

interface UseAdaptiveLearningReturn {
  currentStepIndex: number;
  adaptationActive: boolean;
  consecutiveErrors: number;
  reExplanation: string | null;
  isReExplaining: boolean;
  handleMicroQuizResult: (correct: boolean, step: ElectionStep, userAnswer: string, correctAnswer: string) => Promise<void>;
  moveToNextStep: () => void;
  setCurrentStepIndex: (index: number) => void;
  triggerAdaptation: () => void;
}

/**
 * Manages adaptive learning logic — the intelligence layer.
 * @param userContext - User's session context
 * @param steps - Current election steps
 * @returns Adaptation state and handlers
 */
export function useAdaptiveLearning(
  userContext: UserContext | null,
  steps: ElectionStep[],
  completedSteps: string[] = []
): UseAdaptiveLearningReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    // Resume at the first uncompleted step
    const firstUncompleted = steps.findIndex(s => !completedSteps.includes(s.id));
    return firstUncompleted === -1 ? 0 : firstUncompleted;
  });
  const [adaptationActive, setAdaptationActive] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [reExplanation, setReExplanation] = useState<string | null>(null);
  const [isReExplaining, setIsReExplaining] = useState(false);

  const handleMicroQuizResult = useCallback(async (
    correct: boolean,
    step: ElectionStep,
    userAnswer: string,
    correctAnswer: string
  ) => {
    if (correct) {
      setConsecutiveErrors(0);
      setReExplanation(null);
      return;
    }

    const newErrors = consecutiveErrors + 1;
    setConsecutiveErrors(newErrors);

    // Trigger adaptation after threshold
    if (newErrors >= ADAPTATION_THRESHOLD && !adaptationActive) {
      setAdaptationActive(true);
      if (userContext) {
        const updatedCtx = { ...userContext, adaptationActive: true, consecutiveErrors: newErrors };
        await saveUserContext(updatedCtx);
        await logAdaptationTriggered('consecutive_errors', currentStepIndex);
      }
    }

    // Fetch re-explanation from Gemini
    setIsReExplaining(true);
    try {
      const explanation = await reExplainConcept(
        step, userAnswer, correctAnswer,
        adaptationActive || newErrors >= ADAPTATION_THRESHOLD ? 'beginner' : (userContext?.knowledgeLevel ?? 'beginner'),
        userContext?.sessionId
      );
      setReExplanation(explanation);
    } catch {
      setReExplanation(`The correct answer is "${correctAnswer}". ${step.simpleExplanation}`);
    } finally {
      setIsReExplaining(false);
    }
  }, [consecutiveErrors, adaptationActive, userContext, currentStepIndex]);

  const moveToNextStep = useCallback(() => {
    setCurrentStepIndex(prev => prev + 1);
    setReExplanation(null);
  }, []);

  const triggerAdaptation = useCallback(() => {
    setAdaptationActive(true);
  }, []);

  return {
    currentStepIndex, adaptationActive, consecutiveErrors,
    reExplanation, isReExplaining,
    handleMicroQuizResult, moveToNextStep, setCurrentStepIndex,
    triggerAdaptation
  };
}
