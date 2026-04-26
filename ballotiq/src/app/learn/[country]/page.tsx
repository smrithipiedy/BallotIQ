'use client';

/**
 * Adaptive learning page — the core learning experience.
 * Two-column layout with timeline navigation and step content.
 */

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, MessageCircle, Wifi, Database, HardDrive } from 'lucide-react';
import type { Country, UserContext } from '@/types';
import { useElectionGuide } from '@/hooks/useElectionGuide';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useProgress } from '@/hooks/useProgress';
import { useTTS } from '@/hooks/useTTS';
import { useTranslation } from '@/hooks/useTranslation';
import { useMicroQuiz } from '@/hooks/useMicroQuiz';
import { getCountryByCode } from '@/lib/constants/countries';
import { logMicroQuizResult, logStepComplete } from '@/lib/firebase/analytics';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useProactiveAssistant } from '@/hooks/useProactiveAssistant';
import { ProactiveSuggestionBanner } from '@/components/Journey/ProactiveSuggestionBanner';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import Timeline from '@/components/Journey/Timeline';
import StepCard from '@/components/Journey/StepCard';
import MicroQuiz from '@/components/Journey/MicroQuiz';
import ProgressBar from '@/components/Journey/ProgressBar';
import AdaptationNotice from '@/components/Journey/AdaptationNotice';
import LanguageSelector from '@/components/ui/LanguageSelector';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import TranslatedText from '@/components/ui/TranslatedText';

const PollingStationFinder = dynamic(
  () => import('@/components/Location/PollingStationFinder'),
  { ssr: false }
);

interface LearnPageProps {
  params: Promise<{ country: string }>;
}

/** Adaptive learning page with timeline, steps, and micro-quizzes */
export default function LearnPage({ params }: LearnPageProps) {
  const { country: countryParam } = use(params);
  const router = useRouter();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [showQuizForStep, setShowQuizForStep] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(() => Date.now());
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);

  // Navigation guard and state hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserContext(JSON.parse(stored) as UserContext);
      } else {
        router.push('/');
        return;
      }

      const c = getCountryByCode(countryParam.toUpperCase());
      if (c) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCountry(c);
      } else {
        router.push('/');
      }
    }
  }, [countryParam, router]);

  const { language } = useTranslation();
  const { steps, loading, source } = useElectionGuide(
    countryParam.toUpperCase(),
    userContext
  );
  const {
    sessionId, completeStep, completedSteps, isStepComplete, saveMicroQuizResult,
  } = useProgress(countryParam.toUpperCase(), userContext?.knowledgeLevel ?? 'beginner');
  const {
    currentStepIndex, adaptationActive, reExplanation, isReExplaining,
    handleMicroQuizResult, moveToNextStep, setCurrentStepIndex, triggerAdaptation,
  } = useAdaptiveLearning(userContext, steps, completedSteps);
  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(language, sessionId);

  const { suggestion, dismiss, recordInteraction } = useProactiveAssistant({
    userContext,
    currentStepIndex,
    consecutiveErrors,
    completedStepsCount: completedSteps.length,
    totalStepsCount: steps.length,
    onSuggestSimplification: () => triggerAdaptation(),
  });

  const currentStep = steps[currentStepIndex] ?? null;
  const {
    question: microQuestion, selectedAnswer, isCorrect, showResult,
    explanation: microExplanation, loading: microLoading, submitAnswer, reset: resetQuiz,
  } = useMicroQuiz(
    showQuizForStep ? steps.find((s) => s.id === showQuizForStep) ?? null : null,
    userContext
  );

  const allComplete = steps.length > 0 && completedSteps.length >= steps.length;

  const handleComplete = (stepId: string) => {
    const timeSec = Math.round((Date.now() - stepStartTime) / 1000);
    completeStep(stepId);
    logStepComplete(stepId, countryParam.toUpperCase(), timeSec);
    setShowQuizForStep(stepId);
  };

  const handleQuizAnswer = (index: number) => {
    submitAnswer(index);
    const correct = currentStep?.microQuizQuestion
      ? index === currentStep.microQuizQuestion.correctIndex
      : false;
    
    setConsecutiveErrors(prev => correct ? 0 : prev + 1);
    
    saveMicroQuizResult(currentStep?.id ?? '', correct);
    logMicroQuizResult(currentStep?.id ?? '', correct, 1);
    if (currentStep) {
      const correctAnswer = currentStep.microQuizQuestion?.options[currentStep.microQuizQuestion.correctIndex] ?? '';
      const userAnswer = currentStep.microQuizQuestion?.options[index] ?? '';
      handleMicroQuizResult(correct, currentStep, userAnswer, correctAnswer);
    }
    recordInteraction();
  };

  const handleContinue = () => {
    setShowQuizForStep(null);
    resetQuiz();
    moveToNextStep();
    setStepStartTime(Date.now());
  };

  const sourceIcon = source === 'gemini'
    ? <Wifi className="w-3 h-3" />
    : source === 'cache'
      ? <Database className="w-3 h-3" />
      : <HardDrive className="w-3 h-3" />;
  const sourceLabel = source === 'gemini' ? 'Live AI' : source === 'cache' ? 'Cached' : 'Offline Library';

  if (!country || !userContext) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')} 
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group" 
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <img 
                  src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`} 
                  alt="" 
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-semibold text-white tracking-tight leading-none whitespace-nowrap hidden sm:inline">
                  <TranslatedText text={country.name} />
                </span>
              </div>
              <KnowledgeMeter level={userContext.knowledgeLevel} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-gray-400">
              <span className="text-blue-400">{sourceIcon}</span>
              <TranslatedText text={sourceLabel} />
            </div>
            <LanguageSelector />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <ProgressBar current={completedSteps.length} total={steps.length} />
        </div>
        {suggestion && (
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <ProactiveSuggestionBanner suggestion={suggestion} onDismiss={dismiss} />
          </div>
        )}
      </header>

      <AdaptationNotice isVisible={adaptationActive} />

      <ErrorBoundary componentName="LearnPage">
        {loading ? (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <LoadingSkeleton lines={6} />
            <div className="mt-8"><LoadingSkeleton lines={4} /></div>
          </div>
        ) : allComplete ? (
          /* Completion screen */
          <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white"><TranslatedText text="Learning Complete!" /></h2>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <TranslatedText text="You have completed all steps for" />
              <img 
                src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`} 
                alt="" 
                className="w-5 h-3 object-cover rounded-sm shadow-sm inline-block"
              />
              <TranslatedText text={country.name} />
              <TranslatedText text="'s election process." />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/quiz/')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:scale-105 transition-all"
                aria-label="Take the certification quiz"
              >
                <TranslatedText text="Take Your Quiz" /> 🎯
              </button>
              <button
                onClick={() => router.push('/assistant/')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/15 transition-all"
                aria-label="Open AI assistant"
              >
                <TranslatedText text="Ask AI Assistant" /> 🤖
              </button>
            </div>
            {country && <PollingStationFinder country={country} />}
          </div>
        ) : (
          /* Learning content */
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
            {/* Timeline sidebar - visible on mobile as a stack, but styled differently */}
            <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-32 self-start">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 lg:p-0 lg:bg-transparent lg:border-none">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2 lg:hidden">
                  <TranslatedText text="Learning Path" />
                </h4>
                <Timeline
                  steps={steps}
                  currentStepIndex={currentStepIndex}
                  completedSteps={completedSteps}
                  onStepClick={setCurrentStepIndex}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 w-full max-w-4xl space-y-6 mx-auto">
              {currentStep && (
                <>
                  <StepCard
                    step={currentStep}
                    isActive={!isStepComplete(currentStep.id)}
                    isCompleted={isStepComplete(currentStep.id)}
                    knowledgeLevel={userContext.knowledgeLevel}
                    userConfusion={userContext.mainConfusion}
                    isFallbackContent={source === 'fallback'}
                    onComplete={() => handleComplete(currentStep.id)}
                    onSpeak={toggleTTS}
                    adaptationActive={adaptationActive}
                    isSpeaking={isSpeaking}
                    currentSpokenText={currentText}
                    electionBodyUrl={country.electionBodyUrl}
                    onInteraction={recordInteraction}
                  />
                  {showQuizForStep === currentStep.id && (
                    <MicroQuiz
                      question={microQuestion}
                      loading={microLoading}
                      selectedAnswer={selectedAnswer}
                      isCorrect={isCorrect}
                      showResult={showResult}
                      explanation={microExplanation}
                      reExplanation={reExplanation}
                      isReExplaining={isReExplaining}
                      onSubmit={handleQuizAnswer}
                      onContinue={handleContinue}
                      onSpeak={toggleTTS}
                      isSpeaking={isSpeaking}
                      currentText={currentText}
                      onInteraction={recordInteraction}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </ErrorBoundary>

      {/* Floating assistant button */}
      {!allComplete && (
        <button
          onClick={() => router.push('/assistant/')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition-all z-30"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
