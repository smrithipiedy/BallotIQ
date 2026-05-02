'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface StepNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  canContinue: boolean;
  onPrevious: () => void;
  onContinue: () => void;
}

/**
 * Navigation controls for moving between learning steps.
 */
export default function StepNavigation({
  currentStepIndex,
  totalSteps,
  canContinue,
  onPrevious,
  onContinue,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-8 border-t border-white/5">
      <button
        disabled={currentStepIndex === 0}
        onClick={onPrevious}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-0 transition-all group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <TranslatedText text="Previous" />
      </button>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        <span className="text-white">{currentStepIndex + 1}</span>
        <span className="opacity-30">/</span>
        <span>{totalSteps}</span>
      </div>

      <button
        disabled={!canContinue || currentStepIndex === totalSteps - 1}
        onClick={onContinue}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 disabled:opacity-0 transition-all group"
      >
        <TranslatedText text="Continue" />
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
