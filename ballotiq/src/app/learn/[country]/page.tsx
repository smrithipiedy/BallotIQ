'use client';

import { useLearnPageLogic } from '@/hooks/useLearnPageLogic';
import TranslatedText from '@/components/ui/TranslatedText';
import BottomNav from '@/components/ui/BottomNav';
import { ProactiveSuggestionBanner } from '@/components/Journey/ProactiveSuggestionBanner';
import LearnPageHeader from '@/components/Journey/LearnPageHeader';
import LearnPageBottomNav from '@/components/Journey/LearnPageBottomNav';
import CompletionScreen from '@/components/Journey/CompletionScreen';
import JourneyTimelineSidebar from '@/components/Journey/JourneyTimelineSidebar';
import StepNavigation from '@/components/Journey/StepNavigation';
import ActiveStepContent from '@/components/Journey/ActiveStepContent';
import LearnPageLoading from '@/components/Journey/LearnPageLoading';

/**
 * Older design of the Learn page — Optimized for unified UI.
 * Features a sidebar timeline and single-step focus with adaptive learning.
 */
export default function LearnPage() {
  const {
    router, countryCode, userContext, country, steps, guideLoading,
    completedSteps, currentStepIndex, setCurrentStepIndex, activeStep,
    adaptationActive, reExplanation, isReExplaining,
    suggestion, dismiss, recordInteraction,
    question, quizLoading, selectedAnswer, isCorrect, showResult, explanation,
    submitAnswer, resetQuiz, toggleTTS, isSpeaking, currentText,
    handleStepClick, moveToNextStep, completeStep
  } = useLearnPageLogic();

  if (guideLoading || !userContext) {
    return <LearnPageLoading />;
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
      <LearnPageHeader
        countryCode={countryCode}
        countryName={userContext.countryName}
        knowledgeLevel={userContext.knowledgeLevel}
        adaptationActive={adaptationActive}
        onBack={() => router.push('/choose-path')}
        onFindPollingStations={() => router.push('/polling-stations')}
        onAiAssistant={() => router.push('/assistant')}
      />

      {/* Proactive Suggestion Overlay */}
      {suggestion && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-[60]">
          <ProactiveSuggestionBanner suggestion={suggestion} onDismiss={dismiss} />
        </div>
      )}

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] pb-16 md:pb-0">
        <LearnPageBottomNav
          steps={steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        <JourneyTimelineSidebar
          steps={steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          isAllStepsDone={isAllStepsDone}
          onStepClick={handleStepClick}
          onTakeQuiz={() => router.push('/quiz')}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-12 lg:px-20 min-w-0">
          <div className="max-w-3xl mx-auto space-y-16">
            {activeStep ? (
              <>
                <ActiveStepContent
                  steps={steps}
                  activeStep={activeStep}
                  currentStepIndex={currentStepIndex}
                  completedSteps={completedSteps}
                  userContext={userContext}
                  adaptationActive={adaptationActive}
                  isSpeaking={isSpeaking}
                  currentText={currentText}
                  electionBodyUrl={country?.electionBodyUrl}
                  quizLoading={quizLoading}
                  question={question}
                  selectedAnswer={selectedAnswer}
                  isCorrect={isCorrect}
                  showResult={showResult}
                  explanation={explanation}
                  reExplanation={reExplanation}
                  isReExplaining={isReExplaining}
                  onComplete={() => {
                    completeStep(activeStep.id);
                    recordInteraction();
                  }}
                  onToggleTTS={toggleTTS}
                  onInteraction={recordInteraction}
                  onSubmitQuiz={submitAnswer}
                  onContinueQuiz={() => {
                    if (currentStepIndex < steps.length - 1) {
                      moveToNextStep();
                      resetQuiz();
                      recordInteraction();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      router.push('/quiz');
                    }
                  }}
                />

                {/* Step Navigation Controls */}
                <StepNavigation
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  canContinue={completedSteps.includes(activeStep.id)}
                  onPrevious={() => handleStepClick(currentStepIndex - 1)}
                  onContinue={() => {
                    moveToNextStep();
                    resetQuiz();
                    recordInteraction();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 animate-pulse">
                <p className="text-gray-500 text-sm font-medium">
                  <TranslatedText text="Select a module from the timeline to resume your journey." />
                </p>
              </div>
            )}

            {showCurriculumComplete && (
              <CompletionScreen
                countryName={userContext.countryName}
                onReview={() => setCurrentStepIndex(steps.length - 1)}
                onTakeQuiz={() => router.push('/quiz')}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav activeTab="learn" countryCode={userContext.countryCode} />
    </div>
  );
}
