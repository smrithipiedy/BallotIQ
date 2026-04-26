'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MessageSquare, Map, Mic, Globe } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country, UserContext } from '@/types';

/**
 * Path selection page — shown after country selection.
 * Allows users to choose between Guided Learning and Open Chat.
 */
export default function ChoosePathPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_country');
      if (stored) {
        setSelectedCountry(JSON.parse(stored) as Country);
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const startGuidedPath = () => {
    router.push('/assess/');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 flex flex-col items-center justify-center p-6 relative">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/#country-selection')}
        className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="max-w-4xl w-full text-center space-y-12 animate-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <img 
              src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`} 
              alt="" 
              className="w-4 h-3 object-cover rounded-sm"
            />
            <span>{selectedCountry.name}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            <TranslatedText text="How do you want to learn?" />
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            <TranslatedText text="Choose the experience that fits your pace. Deep dive with a structured path or just talk with our AI assistant." />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Talk with AI - PRIMARY */}
          <button
            onClick={startOpenChat}
            className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            <div className="relative h-full p-8 sm:p-10 rounded-[2.25rem] bg-[#080815] flex flex-col items-center text-center space-y-6 overflow-hidden">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
              
              <div className="w-20 h-20 rounded-3xl bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white">
                  <TranslatedText text="Talk with AI" />
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  <TranslatedText text="Just text or talk directly. The assistant knows your country and explains everything conversationally." />
                </p>
              </div>

              <div className="flex items-center gap-3 px-6 py-3 bg-blue-500 text-white font-bold rounded-2xl group-hover:bg-blue-400 transition-colors">
                <TranslatedText text="Start Conversation" />
                <Mic className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Guided Path */}
          <button
            onClick={startGuidedPath}
            className="group p-1 rounded-[2.5rem] bg-white/5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="p-8 sm:p-10 rounded-[2.25rem] bg-[#050510] border border-white/5 h-full flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-rotate-6 transition-transform">
                <Map className="w-10 h-10 text-gray-300" />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white">
                  <TranslatedText text="Guided Path" />
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  <TranslatedText text="Structured lessons, personalized roadmaps, micro-quizzes, and official certification." />
                </p>
              </div>

              <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-4 transition-all">
                <TranslatedText text="Start Guided Learning" />
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        <button 
          onClick={() => router.push('/#country-selection')}
          className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4"
        >
          <TranslatedText text="Change Country" />
        </button>
      </div>
    </div>
  );
}
