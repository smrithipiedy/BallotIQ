'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  MessageCircle,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { UserContext } from '@/types';
import { getCountryByCode } from '@/lib/constants/countries';
import { useTTS } from '@/hooks/useTTS';
import { useProgress } from '@/hooks/useProgress';
import { useElectionGuide } from '@/hooks/useElectionGuide';
import { useMicroQuiz } from '@/hooks/useMicroQuiz';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useProactiveAssistant } from '@/hooks/useProactiveAssistant';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import TranslatedText from '@/components/ui/TranslatedText';
import BottomNav from '@/components/ui/BottomNav';
import StepCard from '@/components/Journey/StepCard';
import Timeline from '@/components/Journey/Timeline';
import MicroQuiz from '@/components/Journey/MicroQuiz';
import { ProactiveSuggestionBanner } from '@/components/Journey/ProactiveSuggestionBanner';
import PollingStationFinder from '@/components/Location/PollingStationFinder';
import LanguageSelector from '@/components/ui/LanguageSelector';
import AIStatusBadge from '@/components/ui/AIStatusBadge';
import Image from 'next/image';

/**
 * Older design of the Learn page — Optimized for unified UI.
 * Features a sidebar timeline and single-step focus with adaptive learning.
 */
export default function LearnPage() {
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
  const { steps, loading: guideLoading, source: guideSource } = useElectionGuide(countryCode, userContext);
  
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

  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'assistant'>('learn');

  const handleStepClick = (index: number) => {
    stopTTS();
    resetQuiz();
    setCurrentStepIndex(index);
    recordInteraction();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (guideLoading || !userContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl space-y-8">
          <div className="h-12 w-48 bg-white/5 rounded-2xl animate-pulse" />
          <LoadingSkeleton lines={10} />
        </div>
        <p className="mt-8 text-blue-400 animate-pulse font-medium tracking-widest uppercase text-[10px]">
          <TranslatedText text="Tailoring your path..." />
        </p>
      </div>
    );
  }

  const isAllStepsDone = completedSteps.length >= steps.length && steps.length > 0;
  // Determine if we should show the curriculum complete screen
  const showCurriculumComplete = isAllStepsDone && currentStepIndex >= steps.length;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30"
      onMouseMove={recordInteraction}
      onClick={recordInteraction}
    >
      {/* Header — Matching Assistant Page */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/choose-path')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm"
              aria-label="Back to selection"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
              <TranslatedText text="Learn" />
            </h1>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
                <Image
                  src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                  alt={`Flag of ${userContext.countryName}`}
                  width={80}
                  height={50}
                  unoptimized
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-bold text-white tracking-tight leading-none">
                  <TranslatedText text={userContext.countryName} />
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  <TranslatedText text={userContext.knowledgeLevel} />
                </span>
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
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {adaptationActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline"><TranslatedText text="Adaptive" /></span>
              </div>
            )}
            <button
              onClick={() => router.push('/assistant')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 border border-blue-500 text-white font-black text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span><TranslatedText text="AI Assistant" /></span>
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* Proactive Suggestion Overlay */}
        {suggestion && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-[60]">
            <ProactiveSuggestionBanner suggestion={suggestion} onDismiss={dismiss} />
          </div>
        )}
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] pb-16 md:pb-0">
        {/* Mobile Progress Bar */}
        <div className="lg:hidden px-4 py-3 border-b border-white/5 bg-gray-950/40 flex items-center gap-3">
          <div className="flex-1 flex gap-1">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(i)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  completedSteps.includes(step.id) ? 'bg-emerald-500' :
                  i === currentStepIndex ? 'bg-blue-500' : 'bg-white/10'
                }`}
                aria-label={`Step ${i + 1}: ${step.title}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
            {currentStepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Left Sidebar: Timeline (desktop only) */}
        <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] border-r border-white/5 bg-gray-950/40 backdrop-blur-3xl overflow-y-auto p-6 scrollbar-hide">
          <div className="mb-8">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8 px-4">
              <TranslatedText text="Curriculum" />
            </h2>
            <Timeline 
              steps={steps}
              currentStepIndex={currentStepIndex}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {isAllStepsDone && (
            <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-amber-400/10 to-orange-500/5 border border-amber-400/20 text-center space-y-4 shadow-xl shadow-amber-500/5 animate-in zoom-in duration-500">
              <div className="w-14 h-14 bg-amber-400/20 rounded-2xl rotate-12 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20">
                <Trophy className="w-7 h-7 text-amber-400 -rotate-12" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white"><TranslatedText text="Learning Completed!" /></h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold"><TranslatedText text="Ready for the quiz?" /></p>
              </div>
              <button
                onClick={() => router.push('/quiz')}
                className="w-full py-4 bg-amber-400 text-black font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-tighter"
              >
                <TranslatedText text="Take Quiz" />
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-12 lg:px-20 min-w-0">
          <div className="max-w-3xl mx-auto space-y-16">
            {activeStep ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <StepCard
                  step={activeStep}
                  isActive={true}
                  isCompleted={completedSteps.includes(activeStep.id)}
                  knowledgeLevel={userContext.knowledgeLevel}
                  userConfusion={userContext.mainConfusion}
                  onComplete={() => {
                    completeStep(activeStep.id);
                    recordInteraction();
                  }}
                  onSpeak={toggleTTS}
                  adaptationActive={adaptationActive}
                  isSpeaking={isSpeaking}
                  currentSpokenText={currentText}
                  electionBodyUrl={country?.electionBodyUrl}
                  onInteraction={recordInteraction}
                />

                {/* MicroQuiz reinforcement */}
                {completedSteps.includes(activeStep.id) && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                    <MicroQuiz
                      question={question}
                      loading={quizLoading}
                      selectedAnswer={selectedAnswer}
                      isCorrect={isCorrect}
                      showResult={showResult}
                      explanation={explanation}
                      reExplanation={reExplanation}
                      isReExplaining={isReExplaining}
                      onSubmit={submitAnswer}
                      onContinue={() => {
                        if (currentStepIndex < steps.length - 1) {
                          moveToNextStep();
                          resetQuiz();
                          recordInteraction();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          router.push('/quiz');
                        }
                      }}
                      onSpeak={toggleTTS}
                      isSpeaking={isSpeaking}
                      currentText={currentText}
                      onInteraction={recordInteraction}
                    />
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => handleStepClick(currentStepIndex - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-0 transition-all group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <TranslatedText text="Previous" />
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <span className="text-white">{currentStepIndex + 1}</span>
                    <span className="opacity-30">/</span>
                    <span>{steps.length}</span>
                  </div>

                  <button
                    disabled={!completedSteps.includes(activeStep.id) || currentStepIndex === steps.length - 1}
                    onClick={() => {
                      moveToNextStep();
                      resetQuiz();
                      recordInteraction();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 disabled:opacity-0 transition-all group"
                  >
                    <TranslatedText text="Continue" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 animate-pulse">
                <p className="text-gray-500 text-sm font-medium">
                  <TranslatedText text="Select a module from the timeline to resume your journey." />
                </p>
              </div>
            )}

            {/* Completion Modal/Overlay */}
            {showCurriculumComplete && (
              <div className="fixed inset-0 z-[70] bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in duration-500">
                <button
                  onClick={() => setCurrentStepIndex(steps.length - 1)}
                  className="absolute top-6 left-6 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group flex items-center gap-2 font-bold text-sm"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <TranslatedText text="Review Modules" />
                </button>
                <div className="max-w-2xl w-full text-center space-y-8 mt-10">
                  <div className="w-24 h-24 bg-amber-400/20 rounded-[2.5rem] rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 border border-amber-400/20">
                    <Trophy className="w-12 h-12 text-amber-400 -rotate-12" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                      <TranslatedText text="Curriculum Complete!" /> 🎉
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                      <TranslatedText text="You've mastered the election process for" /> {userContext.countryName}. 
                      <TranslatedText text="Ready to earn your certification?" />
                    </p>
                  </div>
                  
                  <button
                    onClick={() => router.push('/quiz')}
                    className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase text-lg tracking-widest"
                  >
                    <TranslatedText text="Take Final Quiz" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav activeTab="learn" countryCode={userContext.countryCode} />
    </div>
  );
}
