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
    if (!stored) return null;
    return JSON.parse(stored) as Country;
  });

  useEffect(() => {
    if (!selectedCountry) router.push('/');
  }, [router, selectedCountry]);

  /**
   * Navigates the user to the diagnostic assessment flow.
   */
  const startGuidedPath = () => {
    router.push('/assess/');
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

  if (!selectedCountry) return null;

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50">
        <button 
          onClick={() => router.push('/#countries')}
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSelector />
        </div>
      </nav>

      <div className="max-w-4xl w-full text-center space-y-6 md:space-y-12 animate-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
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
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            <TranslatedText text="How do you want to learn?" />
          </h1>
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            <TranslatedText text="Choose the experience that fits your pace. Deep dive with a structured path or just talk with our AI assistant." />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Talk with AI */}
          <button
            onClick={startOpenChat}
            className="group border border-white/[0.08] rounded-2xl p-5 bg-white/[0.02] hover:border-blue-800/40 hover:bg-blue-950/10 transition-all text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  <TranslatedText text="Talk with AI" />
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  <TranslatedText text="Just text or talk directly. The assistant knows your country and explains everything." />
                </p>
              </div>

              <div className="border border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500/10 rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors">
                <TranslatedText text="Start Conversation" />
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Guided Path */}
          <button
            onClick={startGuidedPath}
            className="group border border-white/[0.08] rounded-2xl p-5 bg-white/[0.02] hover:border-blue-800/40 hover:bg-blue-950/10 transition-all text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Map className="w-6 h-6 text-gray-300" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  <TranslatedText text="Guided Path" />
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  <TranslatedText text="Structured lessons, roadmaps, micro-quizzes, and official certification." />
                </p>
              </div>

              <div className="border border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500/10 rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors">
                <TranslatedText text="Start Guided Learning" />
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 md:pt-8">
          <button 
            onClick={() => router.push('/#countries')}
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-lg text-sm font-semibold"
          >
            <TranslatedText text="Change Country" />
          </button>
        </div>
      </div>
    </div>
  );
}
