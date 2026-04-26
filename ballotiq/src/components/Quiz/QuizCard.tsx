'use client';

/**
 * Quiz question card for the final certification quiz.
 * Shows options with A/B/C/D labels and result highlighting.
 */

import type { QuizQuestion } from '@/types';
import TranslatedText from '@/components/ui/TranslatedText';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  showResult: boolean;
  onAnswer: (index: number) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

/** Quiz question with labeled options and result feedback */
export default function QuizCard({
  question, questionNumber, totalQuestions,
  selectedAnswer, showResult, onAnswer,
}: QuizCardProps) {
  return (
    <div className="space-y-6" role="region" aria-label={`Question ${questionNumber} of ${totalQuestions}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          <TranslatedText text="Question" /> {questionNumber} <TranslatedText text="of" /> {totalQuestions}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          question.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
          question.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400' :
          'bg-red-500/15 text-red-400'
        }`}>
          <TranslatedText text={question.difficulty} />
        </span>
      </div>

      <h3 className="text-xl font-semibold text-white leading-relaxed">
        <TranslatedText text={question.question} />
      </h3>

      <div className="space-y-4" role="radiogroup" aria-label="Answer choices">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrectOpt = i === question.correctIndex;
          let classes = 'bg-white/[0.03] border-white/5 text-gray-300 hover:bg-white/10 hover:border-blue-500/30 cursor-pointer';

          if (showResult) {
            if (isCorrectOpt) {
              classes = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/5';
            } else if (isSelected) {
              classes = 'bg-red-500/10 border-red-500/30 text-red-300 shadow-lg shadow-red-500/5';
            } else {
              classes = 'bg-white/[0.01] border-white/5 text-gray-600 opacity-60';
            }
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={showResult}
              className={`group flex items-center gap-5 w-full px-6 py-5 border backdrop-blur-xl rounded-[2rem] text-left transition-all duration-300 disabled:cursor-default ${classes}`}
              aria-label={`${LABELS[i]}: ${option}`}
              role="radio"
              aria-checked={isSelected}
            >
              <span className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
                showResult && isCorrectOpt ? 'bg-emerald-500 text-white' :
                isSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
              }`}>
                {LABELS[i]}
              </span>
              <span className="text-[15px] font-medium leading-relaxed"><TranslatedText text={option} /></span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl" aria-live="polite">
          <p className="text-sm text-blue-300">
            <span className="font-semibold"><TranslatedText text="Explanation:" /> </span>
            <TranslatedText text={question.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}
