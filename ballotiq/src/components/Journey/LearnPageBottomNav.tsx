'use client';

import type { ElectionStep } from '@/types';

interface LearnPageBottomNavProps {
  steps: ElectionStep[];
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick: (index: number) => void;
}

/**
 * Mobile-only bottom navigation bar showing curriculum progress.
 */
export default function LearnPageBottomNav({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
}: LearnPageBottomNavProps) {
  return (
    <div className="lg:hidden px-4 py-3 border-b border-white/5 bg-gray-950/40 flex items-center gap-3">
      <div className="flex-1 flex gap-1">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => onStepClick(i)}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              completedSteps.includes(step.id) ? 'bg-emerald-500' :
              i === currentStepIndex ? 'bg-blue-500' : 'bg-white/10'
            }`}
            aria-label={`Step ${i + 1}: ${step.title}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
        {currentStepIndex + 1}/{steps.length}
      </span>
    </div>
  );
}
