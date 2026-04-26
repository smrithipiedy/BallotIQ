'use client';

/**
 * Hook for managing the final certification quiz.
 * Generates personalized questions and tracks results.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ElectionStep, QuizPhase, QuizQuestion, QuizResult, UserContext } from '@/types';
import { generatePersonalizedQuiz } from '@/lib/gemini/operations';

interface UseQuizReturn {
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  results: QuizResult[];
  phase: QuizPhase;
  score: number;
  answerQuestion: (index: number) => void;
  nextQuestion: () => void;
  loading: boolean;
}

/**
 * Manages the final personalized quiz flow.
 * @param completedSteps - Steps the user has studied
 * @param userContext - User session context
 * @returns Quiz state and controls
 */
export function useQuiz(
  completedSteps: ElectionStep[],
  userContext: UserContext | null
): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef<number>(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userContext || completedSteps.length === 0 || fetchedRef.current) return;
    fetchedRef.current = true;

    async function loadQuiz() {
      setLoading(true);
      try {
        const qs = await generatePersonalizedQuiz(
          completedSteps,
          userContext!.knowledgeLevel,
          userContext!.countryCode,
          userContext!.sessionId
        );
        setQuestions(qs);
        startTimeRef.current = Date.now();
        setPhase('active');
      } catch {
        startTimeRef.current = Date.now();
        setPhase('active');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [completedSteps, userContext]);

  const answerQuestion = useCallback((selectedIndex: number) => {
    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const result: QuizResult = {
      questionId: q.id,
      selectedIndex,
      isCorrect: selectedIndex === q.correctIndex,
      timeTakenSeconds: timeTaken,
    };
    setResults((prev) => [...prev, result]);
    setPhase('reviewing');
  }, [questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase('active');
      startTimeRef.current = Date.now();
    } else {
      setPhase('complete');
    }
  }, [currentIndex, questions.length]);

  const score = results.filter((r) => r.isCorrect).length;

  return {
    questions,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex, results, phase, score,
    answerQuestion, nextQuestion, loading,
  };
}
