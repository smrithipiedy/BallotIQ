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
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'bg-blue-950/90 backdrop-blur-md border-blue-700/50 text-white',
        'animate-in slide-in-from-top-2 duration-300'
      )}
    >
      <Lightbulb
        className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="text-sm text-blue-100">
          <TranslatedText text={suggestion.message} />
        </p>
        <div className="mt-2 flex gap-2">
          {suggestion.actionHref ? (
            <Link
              href={suggestion.actionHref}
              onClick={onDismiss}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 
                         rounded-lg transition-colors focus-visible:ring-2 
                         focus-visible:ring-white"
              aria-label={suggestion.actionLabel}
            >
              <TranslatedText text={suggestion.actionLabel} />
            </Link>
          ) : (
            <button
              onClick={suggestion.onAction}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 
                         rounded-lg transition-colors focus-visible:ring-2 
                         focus-visible:ring-white"
              aria-label={suggestion.actionLabel}
            >
              <TranslatedText text={suggestion.actionLabel} />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-xs px-3 py-1 text-blue-300 hover:text-white 
                       transition-colors"
            aria-label="Dismiss suggestion"
          >
            <TranslatedText text="Dismiss" />
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-blue-400 hover:text-white transition-colors"
        aria-label="Close suggestion"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
