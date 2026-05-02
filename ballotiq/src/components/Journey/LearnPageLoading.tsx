'use client';

import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import TranslatedText from '@/components/ui/TranslatedText';

/**
 * Loading state for the learning page.
 */
export default function LearnPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="h-12 w-48 bg-white/5 rounded-2xl animate-pulse" />
        <LoadingSkeleton lines={10} />
      </div>
      <p className="mt-8 text-blue-400 animate-pulse font-medium tracking-widest uppercase text-[10px]">
        <TranslatedText text="Tailoring your path..." />
      </p>
    </div>
  );
}
