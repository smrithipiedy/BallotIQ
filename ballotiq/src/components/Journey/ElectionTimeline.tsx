'use client';

import type { ElectionStep } from '@/types';
import { Check } from 'lucide-react';
import React from 'react';

/**
 * Horizontal scrollable timeline showing election steps progress.
 * Displays nodes for each step with status-specific styling and connecting lines.
 */
interface ElectionTimelineProps {
  steps: ElectionStep[];
  currentStepIndex: number;
}

export default function ElectionTimeline({ steps, currentStepIndex }: ElectionTimelineProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-2">
      <div className="flex items-center gap-0 min-w-max px-4 py-3" role="list">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Node and Labels */}
              <div 
                className="flex flex-col items-center"
                role="listitem"
                aria-label={`Step ${step.order}: ${step.title}, ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#020817]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.order}
                </div>
                
                <span className="text-[10px] text-slate-400 text-center max-w-[4rem] leading-tight mt-1 truncate">
                  {step.title}
                </span>
                {step.timeline && (
                  <span className="text-[9px] text-slate-600 text-center max-w-[4rem] truncate">
                    {step.timeline}
                  </span>
                )}
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 flex-shrink-0 mx-[-4px] mt-[-18px] transition-colors duration-300 ${
                    idx < currentStepIndex ? 'bg-green-600' : 'bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
