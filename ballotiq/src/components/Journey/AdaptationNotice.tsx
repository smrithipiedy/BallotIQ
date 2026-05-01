'use client';

import TranslatedText from '@/components/ui/TranslatedText';

interface AdaptationNoticeProps {
  isVisible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Inline alert card shown below the current step when adaptation is suggested */
export default function AdaptationNotice({ isVisible, onConfirm, onDismiss }: AdaptationNoticeProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-blue-950/40 border border-blue-800/30 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-sm text-gray-300 leading-relaxed">
        <TranslatedText text="Getting a few wrong is completely normal! Want me to switch to simpler explanations?" />
      </p>
      <div className="flex gap-2 mt-1">
        <button
          onClick={onConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <TranslatedText text="Simplify for me" />
        </button>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2 transition-colors"
        >
          <TranslatedText text="Dismiss" />
        </button>
      </div>
    </div>
  );
}
