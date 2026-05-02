'use client';

import { ArrowLeft, Trophy } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface CompletionScreenProps {
  countryName: string;
  onReview: () => void;
  onTakeQuiz: () => void;
}

/**
 * Screen displayed when all learning modules are completed.
 */
export default function CompletionScreen({
  countryName,
  onReview,
  onTakeQuiz,
}: CompletionScreenProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in duration-500">
      <button
        onClick={onReview}
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
            <TranslatedText text="You've mastered the election process for" /> {countryName}. 
            <TranslatedText text="Ready to earn your certification?" />
          </p>
        </div>
        
        <button
          onClick={onTakeQuiz}
          className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase text-lg tracking-widest"
        >
          <TranslatedText text="Take Final Quiz" />
        </button>
      </div>
    </div>
  );
}
