'use client';

/**
 * Final certification quiz page.
 * Generates personalized questions based on completed learning steps.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, MapPin } from 'lucide-react';
import type { ElectionStep, UserContext } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';
import { useProgress } from '@/hooks/useProgress';
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
import BottomNav from '@/components/ui/BottomNav';
import { useMemo } from 'react';

/** Personalized certification quiz page */
export default function QuizPage() {
  const router = useRouter();
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_context');
    return stored ? (JSON.parse(stored) as UserContext) : null;
  });

  const [mounted, setMounted] = useState(false);
  const [insight, setInsight] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [proceedAnyway, setProceedAnyway] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { progress, completedSteps: completedStepIds } = useProgress(
    userContext?.countryCode || 'IN',
    userContext?.knowledgeLevel || 'beginner'
  );

  const completedSteps = useMemo(() => {
    if (!userContext || !progress) return [];
    const guide = getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel);
    if (!guide) return [];
    
    // Fallback to full guide if user hasn't completed any steps yet, 
    // ensuring the quiz page is never empty and loads instantly.
    const filtered = guide.filter(step => completedStepIds.includes(step.id));
    return filtered.length > 0 ? filtered : guide;
  }, [userContext, progress, completedStepIds]);


  useEffect(() => {
    if (!progress || !userContext || proceedAnyway) return;

    const guide = getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel);
    if (!guide) return;

    const uncompleted = guide.filter(s => !completedStepIds.includes(s.id));
    
    if (uncompleted.length > 0) {
      setTimeout(() => setShowWarning(true), 0);
    }
  }, [progress, userContext, completedStepIds, proceedAnyway]);

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

  if (!mounted || !userContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 p-8 flex flex-col items-center justify-center">
        <LoadingSkeleton lines={10} />
      </div>
    );
  }

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

            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
              <TranslatedText text="Quiz" />
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Zap className="w-3 h-3" />
              <TranslatedText text={completedStepIds.length >= (getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel)?.length ?? 0) ? "Certified" : "In Progress"} />
            </div>
            <button
              onClick={() => router.push('/polling-stations')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/60 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 text-xs font-black tracking-wide"
              aria-label="Find polling stations"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              <MapPin className="w-3.5 h-3.5" />
              <TranslatedText text="Find Polling Stations" />
            </button>
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

      {/* Completion Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
              <Zap className="w-10 h-10 text-amber-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white leading-tight">
                <TranslatedText text="Modules Not Finished" />
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                <TranslatedText text="You haven't completed all learning modules yet. Finishing them first will help you score better!" />
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/learn/${userContext.countryCode.toLowerCase()}/`)}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase text-xs tracking-widest"
              >
                <TranslatedText text="Proceed Learning" />
              </button>
              <button
                onClick={() => { setShowWarning(false); setProceedAnyway(true); }}
                className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all text-xs tracking-widest"
              >
                <TranslatedText text="Take Quiz Anyway" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="quiz" countryCode={userContext.countryCode} />
    </div>
  );
}
