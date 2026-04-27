'use client';

/**
 * Micro-quiz component shown after completing a learning step.
 * Provides immediate reinforcement and triggers adaptive logic if needed.
 */

import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Loader2, Sparkles, Brain } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { MicroQuizQuestion } from '@/types';
import TTSButton from '@/components/ui/TTSButton';
import SafeHTML from '@/components/ui/SafeHTML';
import TranslatedText from '@/components/ui/TranslatedText';

interface MicroQuizProps {
  question: MicroQuizQuestion | null;
  loading: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  showResult: boolean;
  explanation: string | null;
  reExplanation: string | null;
  isReExplaining: boolean;
  onSubmit: (index: number) => void;
  onContinue: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  currentText?: string | null;
  onInteraction?: () => void;
}

/** Interactive micro-quiz card with animated feedback */
export default function MicroQuiz({
  question,
  loading,
  selectedAnswer,
  isCorrect,
  showResult,
  explanation,
  reExplanation,
  isReExplaining,
  onSubmit,
  onContinue,
  onSpeak,
  isSpeaking = false,
  currentText = null,
  onInteraction,
}: MicroQuizProps) {
  if (loading && !question) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <ErrorBoundary componentName="MicroQuiz">
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-bottom-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <TranslatedText text="Quick Check" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            <TranslatedText text={question.question} />
          </h3>
          {onSpeak && (
            <TTSButton
              text={question.question}
              isSpeaking={isSpeaking}
              currentText={currentText}
              onToggle={onSpeak}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === question.correctIndex;
            const isWrongSelection = isSelected && !isCorrectOption;
            
            let variantClasses = 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20';
            
            if (showResult) {
              if (isCorrectOption) {
                variantClasses = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
              } else if (isWrongSelection) {
                variantClasses = 'bg-red-500/20 border-red-500/50 text-red-400';
              } else {
                variantClasses = 'bg-white/5 border-white/10 text-gray-600 opacity-50';
              }
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!showResult) {
                    onSubmit(index);
                    onInteraction?.();
                  }
                }}
                disabled={showResult}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${variantClasses} ${
                  !showResult ? 'active:scale-[0.98]' : 'cursor-default'
                }`}
                aria-label={`Option ${index + 1}: ${option}`}
                aria-pressed={isSelected}
              >
                <TranslatedText text={option} />
                {showResult && isCorrectOption && <CheckCircle2 className="w-4 h-4" />}
                {showResult && isWrongSelection && <XCircle className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-4">
            <div className={`p-4 rounded-xl flex gap-3 ${
              isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              <Lightbulb className={`w-5 h-5 flex-shrink-0 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="space-y-1">
                <p className={`text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isCorrect ? <TranslatedText text="Excellent!" /> : <TranslatedText text="Not quite right" />}
                </p>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {isCorrect ? (
                    <TranslatedText text="You have a solid understanding of this concept." />
                  ) : (
                    <TranslatedText text={explanation || ''} />
                  )}
                </div>
              </div>
            </div>

            {!isCorrect && (
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Brain className="w-3 h-3" />
                  <TranslatedText text="Adaptive Reinforcement" />
                </div>
                {isReExplaining ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <TranslatedText text="AI is preparing a simpler explanation..." />
                  </div>
                ) : reExplanation ? (
                  <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none">
                    <SafeHTML html={reExplanation} />
                  </div>
                ) : null}
              </div>
            )}

            <button
              onClick={() => {
                onContinue();
                onInteraction?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
              aria-label="Continue to next step"
            >
              <TranslatedText text="Continue Learning" />
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
