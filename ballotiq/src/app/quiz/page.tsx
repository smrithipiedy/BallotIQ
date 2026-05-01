'use client';

/**
 * Final certification quiz page.
 * Generates personalized questions based on completed learning steps.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import type { ElectionStep, UserContext } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';
import { generatePerformanceInsight } from '@/lib/gemini/client';
import { logQuizComplete } from '@/lib/firebase/analytics';
import { getFallbackGuide } from '@/lib/gemini/fallback';
import QuizCard from '@/components/Quiz/QuizCard';
import ScoreBoard from '@/components/Quiz/ScoreBoard';
import ProgressDots from '@/components/Quiz/ProgressDots';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TranslatedText from '@/components/ui/TranslatedText';
import Image from 'next/image';

/** Personalized certification quiz page */
export default function QuizPage() {
  const router = useRouter();
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      return stored ? JSON.parse(stored) as UserContext : null;
    }
    return null;
  });
  const [completedSteps] = useState<ElectionStep[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      if (stored) {
        const ctx = JSON.parse(stored) as UserContext;
        const fallback = getFallbackGuide(ctx.countryCode, ctx.knowledgeLevel);
        return fallback ?? [];
      }
    }
    return [];
  });
  const [insight, setInsight] = useState('');

  useEffect(() => {
    if (!userContext && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      if (!stored) {
        router.push('/');
      }
    }
  }, [router, userContext]);

  const {
    questions, currentQuestion, currentIndex, results,
    phase, score, answerQuestion, nextQuestion, loading,
  } = useQuiz(completedSteps, userContext);

  useEffect(() => {
    if (phase === 'complete' && userContext && results.length > 0) {
      logQuizComplete(score, questions.length, userContext.countryCode);
      generatePerformanceInsight(
        results, questions, userContext.knowledgeLevel,
        userContext.countryCode, userContext.sessionId
      ).then(setInsight);
    }
  }, [phase, userContext, results, score, questions]);

  if (!userContext) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header — matches learn page style */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push(`/learn/${userContext.countryCode.toLowerCase()}/`)}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm flex-shrink-0"
              aria-label="Back to learning"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Image
                  src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                  alt={`Flag of ${userContext.countryName}`}
                  width={80}
                  height={50}
                  unoptimized
                  className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0"
                />
                <span className="text-sm font-bold text-white tracking-tight leading-none whitespace-nowrap">
                  <TranslatedText text="Quiz" />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Zap className="w-3 h-3" />
              <TranslatedText text="In Progress" />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ErrorBoundary componentName="QuizPage">
          {loading ? (
            <div className="space-y-6">
              <LoadingSkeleton lines={2} />
              <LoadingSkeleton lines={4} />
            </div>
          ) : phase === 'complete' ? (
            <ScoreBoard
              score={score}
              total={questions.length}
              results={results}
              knowledgeLevel={userContext.knowledgeLevel}
              performanceInsight={insight}
              countryName={userContext.countryName}
            />
          ) : currentQuestion ? (
            <div className="space-y-6 sm:space-y-8">
              <ProgressDots total={questions.length} current={currentIndex} results={results} />

              {/* Timer bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-[shrink_60s_linear_forwards]" />
              </div>

              <QuizCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                selectedAnswer={results[currentIndex]?.selectedIndex ?? null}
                showResult={phase === 'reviewing'}
                onAnswer={answerQuestion}
              />

              {phase === 'reviewing' && (
                <button
                  onClick={nextQuestion}
                  className="w-full py-3.5 sm:py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                  aria-label={currentIndex < questions.length - 1 ? 'Next question' : 'See results'}
                >
                  <TranslatedText text={currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400"><TranslatedText text="No quiz questions available." /></p>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
