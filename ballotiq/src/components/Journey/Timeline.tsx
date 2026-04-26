'use client';

/**
 * Vertical timeline showing learning step progress.
 * Visual navigation for the election learning path.
 */

import { CheckCircle2, Lock, Circle } from 'lucide-react';
import type { ElectionStep } from '@/types';

interface TimelineProps {
  steps: ElectionStep[];
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick: (index: number) => void;
}

/** Vertical timeline with animated connecting lines */
export default function Timeline({ steps, currentStepIndex, completedSteps, onStepClick }: TimelineProps) {
  return (
    <nav className="space-y-0" aria-label="Learning progress timeline">
      {steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = i === currentStepIndex;
        // Unlocked if: completed OR current OR the previous step is completed
        const isPreviousCompleted = i === 0 || completedSteps.includes(steps[i - 1].id);
        const isLocked = !isCompleted && !isCurrent && !isPreviousCompleted;

        return (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div className={`absolute left-5 top-12 w-[1px] h-10 ${
                isCompleted ? 'bg-emerald-500/30' : 'bg-white/5'
              }`} />
            )}

            <button
              onClick={() => !isLocked && onStepClick(i)}
              disabled={isLocked}
              className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-left transition-all duration-300 border ${
                isCurrent
                  ? 'bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5'
                  : isCompleted
                    ? 'border-transparent hover:bg-white/5'
                    : 'border-transparent opacity-40 cursor-not-allowed'
              }`}
              aria-label={`Step ${step.order}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ' (locked)'}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : isCurrent ? (
                  <Circle className="w-8 h-8 text-blue-500 animate-pulse" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-600" />
                )}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isCurrent ? 'text-blue-300' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{step.timeline}</p>
              </div>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
