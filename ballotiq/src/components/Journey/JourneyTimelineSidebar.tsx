'use client';

import { Trophy } from 'lucide-react';
import Timeline from '@/components/Journey/Timeline';
import TranslatedText from '@/components/ui/TranslatedText';
import type { ElectionStep } from '@/types';

interface JourneyTimelineSidebarProps {
  steps: ElectionStep[];
  currentStepIndex: number;
  completedSteps: string[];
  isAllStepsDone: boolean;
  onStepClick: (index: number) => void;
  onTakeQuiz: () => void;
}

/**
 * Desktop sidebar for the learning journey.
 * Includes curriculum timeline and completion trophy with quiz CTA.
 */
export default function JourneyTimelineSidebar({
  steps,
  currentStepIndex,
  completedSteps,
  isAllStepsDone,
  onStepClick,
  onTakeQuiz,
}: JourneyTimelineSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] border-r border-white/5 bg-gray-950/40 backdrop-blur-3xl overflow-y-auto p-6 scrollbar-hide">
      <div className="mb-8">
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8 px-4">
          <TranslatedText text="Curriculum" />
        </h2>
        <Timeline 
          steps={steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          onStepClick={onStepClick}
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
            onClick={onTakeQuiz}
            className="w-full py-4 bg-amber-400 text-black font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-tighter"
          >
            <TranslatedText text="Take Quiz" />
          </button>
        </div>
      )}
    </aside>
  );
}
