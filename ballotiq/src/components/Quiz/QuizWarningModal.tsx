'use client';

import { Zap } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface QuizWarningModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onStay: () => void;
}

/**
 * Modal shown when a user tries to take a quiz without completing all modules.
 */
export default function QuizWarningModal({
  isOpen,
  onProceed,
  onStay,
}: QuizWarningModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onProceed}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase text-xs tracking-widest"
          >
            <TranslatedText text="Proceed Learning" />
          </button>
          <button
            onClick={onStay}
            className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all text-xs tracking-widest"
          >
            <TranslatedText text="Take Quiz Anyway" />
          </button>
        </div>
      </div>
    </div>
  );
}
