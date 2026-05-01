'use client';

import { Sparkles, X } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import { clsx } from 'clsx';

interface AdaptationNoticeProps {
  isVisible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Dismissible banner for adaptive mode consent */
export default function AdaptationNotice({ isVisible, onConfirm, onDismiss }: AdaptationNoticeProps) {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Simplification suggestion"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'bg-blue-950/90 backdrop-blur-md border-blue-700/50 text-white',
        'animate-in slide-in-from-top-2 duration-300'
      )}
    >
      <Sparkles
        className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="text-sm text-blue-100">
          <TranslatedText text="Getting a few wrong is completely normal! Want me to switch to simpler explanations?" />
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={onConfirm}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 
                       rounded-lg transition-colors focus-visible:ring-2 
                       focus-visible:ring-white font-bold"
            aria-label="Simplify for me"
          >
            <TranslatedText text="Simplify for me" />
          </button>
          <button
            onClick={onDismiss}
            className="text-xs px-3 py-1 text-blue-300 hover:text-white 
                       transition-colors"
            aria-label="Dismiss"
          >
            <TranslatedText text="Dismiss" />
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-blue-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
