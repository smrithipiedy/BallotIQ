'use client';

/**
 * Answer option buttons for the MicroQuiz component.
 * Handles selection state and result highlighting.
 */

import { CheckCircle2, XCircle } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import type { MicroQuizQuestion } from '@/types';

interface QuizOptionsProps {
  question: MicroQuizQuestion;
  selectedAnswer: number | null;
  showResult: boolean;
  onSubmit: (index: number) => void;
  onInteraction?: () => void;
}

/** Renders the grid of answer option buttons with result highlighting */
export default function QuizOptions({
  question, selectedAnswer, showResult, onSubmit, onInteraction,
}: QuizOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Quiz options">
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
            role="radio"
            aria-checked={isSelected}
          >
            <TranslatedText text={option} />
            {showResult && isCorrectOption && <CheckCircle2 className="w-4 h-4" data-testid="check-circle" />}
            {showResult && isWrongSelection && <XCircle className="w-4 h-4" data-testid="x-circle" />}
          </button>
        );
      })}
    </div>
  );
}
