'use client';

/**
 * THE CORE INTELLIGENCE HOOK.
 * Tracks consecutive errors and triggers adaptation mode
 * when a user struggles with micro-quiz questions.
 */

import { useState, useCallback } from 'react';
import type { ElectionStep, UserContext } from '@/types';
import { reExplainConcept } from '@/lib/gemini/client';
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

    setConsecutiveErrors((prev) => {
      const next = prev + 1;
      // Trigger adaptation after threshold
      if (next >= ADAPTATION_THRESHOLD && !adaptationActive) {
        setAdaptationActive(true);
        if (userContext) {
          const updatedCtx = { ...userContext, adaptationActive: true, consecutiveErrors: next };
          saveUserContext(updatedCtx).catch(console.error);
          logAdaptationTriggered('consecutive_errors', currentStepIndex).catch(console.error);
        }
      }
      return next;
    });

    const isNowAdaptive = adaptationActive || (consecutiveErrors + 1 >= ADAPTATION_THRESHOLD);

    // Fetch re-explanation from Gemini
    setIsReExplaining(true);
    try {
      const explanation = await reExplainConcept(
        step, userAnswer, correctAnswer,
        isNowAdaptive ? 'beginner' : (userContext?.knowledgeLevel ?? 'beginner'),
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
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setReExplanation(null);
    }
  }, [currentStepIndex, steps.length]);

  return {
    currentStepIndex, adaptationActive, consecutiveErrors,
    reExplanation, isReExplaining,
    handleMicroQuizResult, moveToNextStep, setCurrentStepIndex,
  };
}
