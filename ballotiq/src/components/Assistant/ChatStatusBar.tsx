'use client';

/**
 * Disclaimer bar shown below the chat messages area.
 * Communicates the non-partisan, educational nature of BallotIQ.
 */

import TranslatedText from '@/components/ui/TranslatedText';

/** Non-partisan disclaimer strip rendered at the bottom of the chat */
export default function ChatStatusBar() {
  return (
    <p className="px-4 py-1.5 text-[10px] text-gray-500 text-center">
      <TranslatedText text="BallotIQ provides non-partisan educational information only. Not official election guidance." />
    </p>
  );
}
