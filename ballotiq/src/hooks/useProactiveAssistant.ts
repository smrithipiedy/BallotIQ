"use client";

/**
 * Proactive contextual assistance system.
 * Monitors user behavior and proactively surfaces help
 * without waiting for the user to ask.
 * This is what makes BallotIQ a SMART assistant, not just a chatbot.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserContext } from '@/types';
import { logger } from '@/lib/logger';
import { announce } from '@/lib/announce';

export type ProactiveTrigger =
  | 'stuck_on_step'        // user on same step > 3 minutes
  | 'consecutive_errors'   // 2+ wrong micro-quiz answers
  | 'low_quiz_score'       // final quiz score < 60%
  | 'rapid_completion'     // completing steps too fast (not reading)
  | 'idle_too_long'        // no interaction for 5 minutes
  | 'revisiting_step';     // user went back to a completed step

export interface ProactiveSuggestion {
  trigger: ProactiveTrigger;
  message: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}

interface UseProactiveAssistantProps {
  userContext: UserContext | null;
  currentStepIndex: number;
  consecutiveErrors: number;
  completedStepsCount: number;
  totalStepsCount: number;
  onSuggestSimplification: () => void;
}

export function useProactiveAssistant({
  userContext,
  currentStepIndex,
  consecutiveErrors,
  completedStepsCount,
  totalStepsCount,
  onSuggestSimplification,
}: UseProactiveAssistantProps) {
  const [suggestion, setSuggestion] = useState<ProactiveSuggestion | null>(null);
  const stepStartTime = useRef<number | null>(null);
  const lastInteractionTime = useRef<number>(0);
  const rapidCompletionCount = useRef<number>(0);
  const dismissedForStepRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    dismissedForStepRef.current = currentStepIndex;
    setSuggestion(null);
  }, [currentStepIndex]);

  // Track when user arrived at current step (ref-only updates avoid setState-in-effect lint)
  useEffect(() => {
    stepStartTime.current = Date.now();
    dismissedForStepRef.current = null;
    rapidCompletionCount.current = 0;
  }, [currentStepIndex]);

  // Track last interaction
  const recordInteraction = useCallback(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  // Initialize idle timer once the hook mounts.
  useEffect(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  // Single polling loop so all setSuggestion calls happen inside callbacks,
  // keeping this hook compatible with "setState in effect" lint rules.
  useEffect(() => {
    const interval = setInterval(() => {
      if (suggestion) return;

      const isDismissedForStep = dismissedForStepRef.current === currentStepIndex;
      if (isDismissedForStep) return;

      const now = Date.now();

      // 1) Stuck on step for 3+ minutes
      if (stepStartTime.current) {
        const minutesOnStep = (now - stepStartTime.current) / 60000;
        if (minutesOnStep >= 3) {
          const newSuggestion: ProactiveSuggestion = {
            trigger: 'stuck_on_step',
            message:
              "You've been on this step for a while. Would you like me to explain it differently?",
            actionLabel: 'Ask the AI Assistant',
            actionHref: `/assistant?country=${userContext?.countryCode}&context=stuck`,
          };
          setSuggestion(newSuggestion);
          announce('BallotIQ has a suggestion for you.');
          logger.info('Proactive trigger: stuck_on_step', {
            component: 'useProactiveAssistant',
            stepIndex: String(currentStepIndex),
            minutesOnStep: String(Math.round(minutesOnStep)),
          });
          return;
        }

        // 2) Rapid completion (completing steps in under 30 seconds)
        const secondsOnStep = (now - stepStartTime.current) / 1000;
        if (secondsOnStep < 30 && completedStepsCount > 0 && completedStepsCount < totalStepsCount) {
          rapidCompletionCount.current += 1;
          if (rapidCompletionCount.current >= 3 && !isDismissedForStep) {
            setSuggestion({
              trigger: 'rapid_completion',
              message:
                "You're moving quickly! Make sure to read each step carefully — the quiz will test these concepts.",
              actionLabel: 'Got it, I will',
              onAction: dismiss,
            });
            return;
          }
        }
      }

      // 3) Consecutive errors
      if (consecutiveErrors >= 2) {
        setSuggestion({
          trigger: 'consecutive_errors',
          message:
            'Getting a few wrong is completely normal! Want me to switch to simpler explanations?',
          actionLabel: 'Simplify for me',
          onAction: () => {
            onSuggestSimplification();
            dismiss();
          },
        });
        announce('BallotIQ suggests switching to simpler explanations.');
        return;
      }

      // 4) Idle too long (5 minutes no interaction)
      if (lastInteractionTime.current) {
        const minutesIdle = (now - lastInteractionTime.current) / 60000;
        if (minutesIdle >= 5) {
          setSuggestion({
            trigger: 'idle_too_long',
            message:
              'Still there? Take your time — your progress is saved and you can continue anytime.',
            actionLabel: 'Continue learning',
            onAction: dismiss,
          });
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [
    suggestion,
    currentStepIndex,
    consecutiveErrors,
    completedStepsCount,
    totalStepsCount,
    userContext?.countryCode,
    onSuggestSimplification,
    dismiss,
  ]);

  return { suggestion, dismiss, recordInteraction };
}
