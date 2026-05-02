'use client';

import { ArrowLeft, BookOpen, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import LanguageSelector from '@/components/ui/LanguageSelector';
import TranslatedText from '@/components/ui/TranslatedText';
import type { KnowledgeLevel } from '@/types';

interface LearnPageHeaderProps {
  countryCode: string;
  countryName: string;
  knowledgeLevel: KnowledgeLevel;
  adaptationActive: boolean;
  onBack: () => void;
  onFindPollingStations: () => void;
  onAiAssistant: () => void;
}

/**
 * Top navigation bar for the learning page.
 * Includes country branding, knowledge level indicator, and quick actions.
 */
export default function LearnPageHeader({
  countryCode,
  countryName,
  knowledgeLevel,
  adaptationActive,
  onBack,
  onFindPollingStations,
  onAiAssistant,
}: LearnPageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm"
            aria-label="Back to selection"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
            <TranslatedText text="Learn" />
          </h1>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
              <Image
                src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                alt={`Flag of ${countryName}`}
                width={80}
                height={50}
                unoptimized
                className="w-5 h-3.5 object-cover rounded-sm"
              />
              <span className="text-sm font-bold text-white tracking-tight leading-none">
                <TranslatedText text={countryName} />
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                <TranslatedText text={knowledgeLevel} />
              </span>
            </div>
            <button
              onClick={onFindPollingStations}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/60 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 text-xs font-black tracking-wide"
              aria-label="Find polling stations"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              <MapPin className="w-3.5 h-3.5" />
              <TranslatedText text="Find Polling Stations" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {adaptationActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline"><TranslatedText text="Adaptive" /></span>
            </div>
          )}
          <button
            onClick={onAiAssistant}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 border border-blue-500 text-white font-black text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span><TranslatedText text="AI Assistant" /></span>
          </button>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
