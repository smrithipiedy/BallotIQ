'use client';

import TranslatedText from '@/components/ui/TranslatedText';

/**
 * Global presence statistics displayed on the homepage.
 */
export default function StatsRow() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 font-bold text-xl">
          8 <span className="text-sm font-medium tracking-widest uppercase"><TranslatedText text="Countries" /></span>
        </div>
        <div className="flex items-center gap-2 font-bold text-xl">
          8 <span className="text-sm font-medium tracking-widest uppercase"><TranslatedText text="Languages" /></span>
        </div>
        <div className="flex items-center gap-2 font-bold text-xl uppercase tracking-tighter">
          Gemini <span className="text-sm font-medium tracking-widest"><TranslatedText text="AI Core" /></span>
        </div>
      </div>
    </section>
  );
}
