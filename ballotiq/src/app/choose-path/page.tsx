'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MessageSquare, Map, Mic } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import LanguageSelector from '@/components/ui/LanguageSelector';
import type { Country, UserContext } from '@/types';
import Image from 'next/image';

/**
 * Path selection page — shown after country selection.
 * Allows users to choose between Guided Learning and Open Chat.
 */
export default function ChoosePathPage() {
  const router = useRouter();
  const [selectedCountry] = useState<Country | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_country');
    return stored ? (JSON.parse(stored) as Country) : null;
  });
  const [isReady] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    if (!selectedCountry && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [selectedCountry, router]);

  /**
   * Navigates the user to the diagnostic assessment flow.
   */
  const startGuidedPath = () => {
    router.push('/assess');
  };

  /**
   * Navigates the user directly to the AI Assistant with a default context.
   */
  const startOpenChat = () => {
    if (!selectedCountry) return;
    
    const context: UserContext = {
      sessionId: `chat_${Date.now()}`,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      hasVotedBefore: null,
      selfRatedKnowledge: 1,
      mainConfusion: 'Direct query',
      knowledgeLevel: 'beginner',
      language: 'en',
      adaptationActive: false,
      consecutiveErrors: 0,
    };
    
    sessionStorage.setItem('ballotiq_context', JSON.stringify(context));
    router.push('/assistant');
  };

  if (!isReady || !selectedCountry) return null;

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">Skip to main content</a>
      {/* Navigation Header */}
      <nav className="w-full p-3 sm:p-4 md:p-6 flex items-center justify-between z-50 bg-gray-950/50 backdrop-blur-md border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button 
            onClick={() => router.push('/#country-selection')}
            className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
            <TranslatedText text="Choose Path" />
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <LanguageSelector />
        </div>
      </nav>

      {/* Main Content */}
      <div id="main-content" tabIndex={-1} className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3 overflow-hidden outline-none">
        <div className="h-full max-w-4xl w-full text-center flex flex-col justify-between gap-3 sm:gap-5 md:gap-5 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2.5 sm:space-y-4 md:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium mb-4">
              <Image
                src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                alt={`Flag of ${selectedCountry.name}`}
                width={80}
                height={50}
                unoptimized
                className="w-4 h-3 object-cover rounded-sm"
              />
              <span>{selectedCountry.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              <TranslatedText text="How do you want to learn?" />
            </h1>
            <p className="text-gray-400 text-base sm:text-lg md:text-lg max-w-2xl mx-auto leading-relaxed">
              <TranslatedText text="Choose the experience that fits your pace. Deep dive with a structured path or just talk with our AI assistant." />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-4 w-full">
            {/* Talk with AI - PRIMARY */}
            <button
              onClick={startOpenChat}
              className="group relative p-0.5 sm:p-1 rounded-2xl sm:rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
              <div className="relative h-full p-6 sm:p-8 md:p-7 rounded-xl sm:rounded-[1.4rem] md:rounded-[2.25rem] bg-[#080815] flex flex-col items-center text-center space-y-4 sm:space-y-5 md:space-y-4 overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
                
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-xl sm:rounded-2xl md:rounded-3xl bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 text-white" />
                </div>
                
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-bold text-white">
                    <TranslatedText text="Talk with AI" />
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base md:text-base leading-relaxed">
                    <TranslatedText text="Just text or talk directly. The assistant knows your country and explains everything." />
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-7 md:px-7 py-3 sm:py-3.5 md:py-3 bg-blue-500 text-white font-semibold sm:font-bold text-sm sm:text-base md:text-sm rounded-xl sm:rounded-2xl md:rounded-2xl group-hover:bg-blue-400 transition-colors">
                  <TranslatedText text="Start Conversation" />
                  <Mic className="w-5 h-5 sm:w-5 sm:h-5 md:w-5 md:h-5" />
                </div>
              </div>
            </button>

            {/* Guided Path */}
            <button
              onClick={startGuidedPath}
              className="group p-0.5 sm:p-1 rounded-2xl sm:rounded-[1.5rem] md:rounded-[2.5rem] bg-white/5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="p-6 sm:p-8 md:p-7 rounded-xl sm:rounded-[1.4rem] md:rounded-[2.25rem] bg-[#050510] border border-white/5 h-full flex flex-col items-center text-center space-y-4 sm:space-y-5 md:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-rotate-6 transition-transform">
                  <Map className="w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 text-gray-300" />
                </div>

                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-bold text-white">
                    <TranslatedText text="Guided Path" />
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base md:text-base leading-relaxed">
                    <TranslatedText text="Structured lessons, roadmaps, micro-quizzes, and official certification." />
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 text-blue-400 font-semibold text-sm sm:text-base md:text-sm group-hover:gap-4 transition-all">
                  <TranslatedText text="Start Guided Learning" />
                  <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-5 md:h-5" />
                </div>
              </div>
            </button>
          </div>

          <div className="pt-0 sm:pt-1 md:pt-1">
            <button 
              onClick={() => router.push('/#country-selection')}
              className="px-6 sm:px-7 md:px-8 py-3 sm:py-3 md:py-3.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-lg text-sm sm:text-base md:text-base font-semibold"
            >
              <TranslatedText text="Change Country" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
