'use client';

import dynamic from 'next/dynamic';
import type { ElectionStep, UserContext, MicroQuizQuestion } from '@/types';
import StepCard from './StepCard';
import MicroQuiz from './MicroQuiz';

const ElectionTimeline = dynamic(
  () => import('./ElectionTimeline'),
  { ssr: false }
);

interface ActiveStepContentProps {
  steps: ElectionStep[];
  activeStep: ElectionStep;
  currentStepIndex: number;
  completedSteps: string[];
  userContext: UserContext;
  adaptationActive: boolean;
  isSpeaking: boolean;
  currentText: string | null;
  electionBodyUrl?: string;
  quizLoading: boolean;
  question: MicroQuizQuestion | null;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  showResult: boolean;
  explanation: string | null;
  reExplanation: string | null;
  isReExplaining: boolean;
  onComplete: () => void;
  onToggleTTS: (text: string) => void;
  onInteraction: () => void;
  onSubmitQuiz: (answer: number) => void;
  onContinueQuiz: () => void;
}

/**
 * Renders the content for the currently active learning step, including the StepCard and reinforcement quiz.
 */
export default function ActiveStepContent({
  steps,
  activeStep,
  currentStepIndex,
  completedSteps,
  userContext,
  adaptationActive,
  isSpeaking,
  currentText,
  electionBodyUrl,
  quizLoading,
  question,
  selectedAnswer,
  isCorrect,
  showResult,
  explanation,
  reExplanation,
  isReExplaining,
  onComplete,
  onToggleTTS,
  onInteraction,
  onSubmitQuiz,
  onContinueQuiz,
}: ActiveStepContentProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-4 -mx-4 sm:mx-0">
        <ElectionTimeline steps={steps} currentStepIndex={currentStepIndex} />
      </div>
      <StepCard
        step={activeStep}
        isActive={true}
        isCompleted={completedSteps.includes(activeStep.id)}
        knowledgeLevel={userContext.knowledgeLevel}
        userConfusion={userContext.mainConfusion}
        onComplete={onComplete}
        onSpeak={onToggleTTS}
        adaptationActive={adaptationActive}
        isSpeaking={isSpeaking}
        currentSpokenText={currentText}
        electionBodyUrl={electionBodyUrl}
        onInteraction={onInteraction}
      />

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
            onSubmit={onSubmitQuiz}
            onContinue={onContinueQuiz}
            onSpeak={onToggleTTS}
            isSpeaking={isSpeaking}
            currentText={currentText}
            onInteraction={onInteraction}
          />
        </div>
      )}
    </div>
  );
}
