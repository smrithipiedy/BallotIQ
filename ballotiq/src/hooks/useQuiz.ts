'use client';

/**
 * Hook for managing the final certification quiz.
 * Generates personalized questions and tracks results.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ElectionStep, QuizPhase, QuizQuestion, QuizResult, UserContext } from '@/types';
import { generatePersonalizedQuiz, generateLocalFallbackQuiz } from '@/lib/gemini/client';

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
    if (!userContext || fetchedRef.current) return;
    
    // 1. Instantly provide fallback questions for <2s load time
    const localFallback = generateLocalFallbackQuiz(completedSteps, userContext.knowledgeLevel);
    if (localFallback.length > 0) {
      setTimeout(() => {
        setQuestions(localFallback);
        setLoading(false);
        setPhase('active');
      }, 0);
    }

    if (completedSteps.length === 0) {
      setLoading(false);
      setPhase('active');
      return;
    }

    fetchedRef.current = true;

    async function loadQuiz() {
      // Don't set loading(true) again if we already have fallback questions
      try {
        const qs = await generatePersonalizedQuiz(
          completedSteps,
          userContext!.knowledgeLevel,
          userContext!.countryCode,
          userContext!.sessionId
        );
        
        // Only swap if user hasn't started yet to avoid jarring UX
        setQuestions((prev) => (currentIndex === 0 && results.length === 0 ? qs : prev));
        startTimeRef.current = startTimeRef.current || Date.now();
      } catch (err) {
        console.error('Quiz AI fetch failed, using fallback', err);
      } finally {
        setLoading(false);
        setPhase('active');
      }
    }
    loadQuiz();
  }, [completedSteps, userContext]); // eslint-disable-line react-hooks/exhaustive-deps

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
