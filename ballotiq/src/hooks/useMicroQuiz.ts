'use client';

/**
 * Hook for post-step micro-quiz logic.
 * Generates questions, handles answers, and fetches re-explanations.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ElectionStep, MicroQuizQuestion, UserContext } from '@/types';
import { generateMicroQuiz } from '@/lib/gemini/client';

interface UseMicroQuizReturn {
  question: MicroQuizQuestion | null;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  showResult: boolean;
  explanation: string | null;
  loading: boolean;
  submitAnswer: (index: number) => void;
  reset: () => void;
}

/**
 * Manages micro-quiz state for a single learning step.
 * @param step - The election step being quizzed
 * @param userContext - User's session context
 * @param onResult - Callback with quiz result
 * @returns Quiz state and controls
 */
export function useMicroQuiz(
  step: ElectionStep | null,
  userContext: UserContext | null,
  onResult?: (correct: boolean) => void
): UseMicroQuizReturn {
  const [question, setQuestion] = useState<MicroQuizQuestion | null>(() => step?.microQuizQuestion ?? null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!step) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(null);
      return;
    }

    if (step.microQuizQuestion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(step.microQuizQuestion);
      return;
    }

    let cancelled = false;
    async function fetchQuiz() {
      setLoading(true);
      try {
        const q = await generateMicroQuiz(
          step!,
          userContext?.knowledgeLevel ?? 'beginner',
          userContext?.sessionId
        );
        if (!cancelled) setQuestion(q);
      } catch {
        if (!cancelled && step) {
          setQuestion({
            question: `What is the main concept of "${step.title}"?`,
            options: ['Review needed', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            hint: 'Review the step content.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQuiz();
    return () => { cancelled = true; };
  }, [step, userContext]);

  const submitAnswer = useCallback((index: number) => {
    if (!question || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === question.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);
    if (!correct) {
      setExplanation(question.hint);
    }
    onResult?.(correct);
  }, [question, selectedAnswer, onResult]);

  const reset = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);
    setExplanation(null);
  }, []);

  return { question, selectedAnswer, isCorrect, showResult, explanation, loading, submitAnswer, reset };
}
