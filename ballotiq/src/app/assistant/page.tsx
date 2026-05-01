'use client';

/**
 * AI Assistant page — context-aware election Q&A.
 * Full page chat with user context from assessment and learning.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import type { UserContext } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { getFallbackGuide } from '@/lib/gemini/fallback';
import ChatWindow from '@/components/Assistant/ChatWindow';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TranslatedText from '@/components/ui/TranslatedText';
import { getCountryByCode } from '@/lib/constants/countries';
import type { ElectionStep } from '@/types';
import Image from 'next/image';
import { useMemo } from 'react';
import BottomNav from '@/components/ui/BottomNav';

/** Full-page AI assistant with context-aware responses */
export default function AssistantPage() {
  const router = useRouter();
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_context');
    if (!stored) return null;
    
    const ctx = JSON.parse(stored) as UserContext;
    // Hydrate missing metadata if needed
    if (!ctx.electionBody || !ctx.electionBodyUrl) {
      const countryData = getCountryByCode(ctx.countryCode);
      if (countryData) {
        ctx.electionBody = countryData.electionBody;
        ctx.electionBodyUrl = countryData.electionBodyUrl;
        sessionStorage.setItem('ballotiq_context', JSON.stringify(ctx));
      }
    }
    return ctx;
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!userContext) {
      router.push('/');
    } else {
      setIsReady(true);
    }
  }, [userContext, router]);

  const completedSteps = useMemo<ElectionStep[]>(() => {
    if (!userContext) return [];
    return getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel) ?? [];
  }, [userContext]);

  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(
    userContext?.sessionId ?? ''
  );

  if (!isReady || !userContext) return null;

  const countryInfo = getCountryByCode(userContext.countryCode);

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-hidden">
      {/* Header — matches learn page style */}
      {/* Header — matches learn page style */}
      <header className="sticky top-0 z-50 flex-shrink-0 bg-gray-950/80 md:bg-transparent backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
              <TranslatedText text="Assistant" />
            </h1>

            <button
              onClick={() => router.push('/#country-selection')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <Image
                src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                alt={`Flag of ${userContext.countryName}`}
                width={24}
                height={16}
                unoptimized
                className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
              />
              <span className="text-sm font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                <TranslatedText text={userContext.countryName} />
              </span>
              <div className="w-px h-3 bg-white/10 mx-1" />
              <KnowledgeMeter level={userContext.knowledgeLevel} compact />
            </button>

            <div className="flex sm:hidden items-center gap-2">
              <Image
                src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                alt=""
                width={20}
                height={14}
                className="w-5 h-3.5 object-cover rounded-sm"
              />
              <span className="text-sm font-bold text-white truncate max-w-[100px]">
                <TranslatedText text={userContext.countryName} />
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => router.push('/polling-stations')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/60 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 text-xs font-black tracking-wide"
              aria-label="Find polling stations"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              <MapPin className="w-3.5 h-3.5" />
              <TranslatedText text="Find Polling Stations" />
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="flex-shrink-0 px-4 py-2 bg-amber-500/5 border-b border-amber-500/10">
        <p className="text-[11px] text-amber-400/80 text-center max-w-2xl mx-auto">
          <TranslatedText text="BallotIQ provides educational information only. For official guidance, visit" />{' '}
          <a
            href={countryInfo?.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-300 font-bold"
          >
            <TranslatedText text={countryInfo?.electionBody || 'your official election body'} />
          </a>.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-hidden max-w-5xl w-full mx-auto px-4 sm:px-6 pb-20 md:pb-5">
        <ErrorBoundary componentName="AssistantPage">
          <ChatWindow
            userContext={userContext}
            completedSteps={completedSteps}
            isSpeaking={isSpeaking}
            currentSpokenText={currentText}
            onSpeak={toggleTTS}
          />
        </ErrorBoundary>
      </div>
      <BottomNav activeTab="assistant" countryCode={userContext.countryCode} />
    </div>
  );
}
