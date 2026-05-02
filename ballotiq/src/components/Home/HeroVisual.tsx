'use client';

import { Brain } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

/**
 * Animated hero visual for the homepage.
 * Includes adaptive learning preview and AI conversation mockup.
 */
export default function HeroVisual() {
  return (
    <div className="relative w-full h-[300px] sm:h-[350px] md:h-[380px] lg:h-[400px] animate-in slide-in-from-right-8 duration-1000">
      {/* Adaptive Learning Card */}
      <div className="absolute top-0 sm:-top-4 right-0 sm:-right-6 w-[188px] sm:w-[280px] p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-[#0A0A1F] border border-white/10 shadow-xl sm:shadow-2xl rotate-2 sm:rotate-3 hover:rotate-0 transition-all duration-500 z-20">
        <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold text-xs sm:text-sm"><TranslatedText text="Adaptive Path" /></h4>
            <p className="text-blue-400 text-[9px] sm:text-[10px] font-medium tracking-widest uppercase"><TranslatedText text="Level: Beginner" /></p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[40%] bg-blue-500 rounded-full animate-pulse" />
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 font-medium">
            <span>2/5 <TranslatedText text="Steps" /></span>
            <span>40% <TranslatedText text="Knowledge" /></span>
          </div>
        </div>
      </div>

      {/* AI Conversation Component */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[320px] p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-xl sm:shadow-2xl z-10 flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-widest"><TranslatedText text="BallotIQ Assistant" /></span>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-start">
            <div className="max-w-[80%] p-2 sm:p-3 rounded-xl sm:rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-[8px] sm:text-[10px] text-gray-300 leading-relaxed">
              <TranslatedText text="How do I register to vote in France?" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] p-2 sm:p-3 rounded-xl sm:rounded-2xl rounded-tr-sm bg-blue-600 text-[8px] sm:text-[10px] text-white leading-relaxed shadow-lg shadow-blue-500/20">
              <TranslatedText text="You can register online via service-public.fr or at your local town hall (mairie)..." />
            </div>
          </div>
        </div>
        <div className="mt-1 sm:mt-2 h-8 sm:h-10 w-full bg-white/5 rounded-lg sm:rounded-xl border border-white/5 flex items-center px-3 sm:px-4 justify-between">
          <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gray-600 rounded-full" />
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* AI Assistant Bubble (Small Accent) */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 w-[180px] sm:w-[240px] p-4 sm:p-5 rounded-xl sm:rounded-[2rem] bg-indigo-600 border border-indigo-400/30 shadow-lg sm:shadow-2xl -rotate-6 hover:rotate-0 transition-all duration-500 z-30">
        <div className="flex gap-2 sm:gap-3 items-start">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs">🤖</span>
          </div>
          <p className="text-white text-[8px] sm:text-[10px] leading-relaxed font-medium">
            <TranslatedText text="I've translated this guide into French for you." />
          </p>
        </div>
      </div>

      {/* Background Decorative Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-blue-500/20 blur-[80px] sm:blur-[100px] rounded-full z-0" />
      
      {/* Grid Line Visual */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] rounded-xl sm:rounded-[2.5rem] border border-white/5" />
    </div>
  );
}
