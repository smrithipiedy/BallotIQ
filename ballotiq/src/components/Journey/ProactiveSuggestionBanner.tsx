"use client";

/**
 * Displays proactive assistant suggestions as a dismissible banner.
 * Only appears when BallotIQ detects the user might need help.
 */

import { X, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';
import type { ProactiveSuggestion } from '@/hooks/useProactiveAssistant';
import Link from 'next/link';
import TranslatedText from '@/components/ui/TranslatedText';

interface Props {
  suggestion: ProactiveSuggestion;
  onDismiss: () => void;
}

export function ProactiveSuggestionBanner({ suggestion, onDismiss }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="BallotIQ suggestion"
      className={clsx(
        'group flex items-start gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border shadow-lg',
        'bg-[#0b1535]/90 backdrop-blur-xl border-blue-400/25 text-white',
        'animate-in slide-in-from-top-2 duration-300'
      )}
    >
      <Lightbulb
        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pr-2">
          <TranslatedText text={suggestion.message} />
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          {suggestion.actionHref ? (
            <Link
              href={suggestion.actionHref}
              onClick={onDismiss}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
              aria-label={suggestion.actionLabel}
            >
              <TranslatedText text={suggestion.actionLabel} />
            </Link>
          ) : (
            <button
              onClick={suggestion.onAction}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
              aria-label={suggestion.actionLabel}
            >
              <TranslatedText text={suggestion.actionLabel} />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Dismiss suggestion"
          >
            <TranslatedText text="Dismiss" />
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-blue-300 hover:text-white transition-colors rounded-md p-0.5 -mr-0.5"
        aria-label="Close suggestion"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
