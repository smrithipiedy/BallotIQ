'use client';

/**
 * AI Assistant page — context-aware election Q&A.
 * Full page chat with user context from assessment and learning.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

/** Full-page AI assistant with context-aware responses */
export default function AssistantPage() {
  const router = useRouter();
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window === 'undefined') return null;

    const stored = sessionStorage.getItem('ballotiq_context');
    if (!stored) return null;

    const ctx = JSON.parse(stored) as UserContext;

    // Hydrate missing metadata for legacy sessions
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

  const completedSteps = useMemo<ElectionStep[]>(() => {
    if (!userContext) return [];
    return getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel) ?? [];
  }, [userContext]);

  useEffect(() => {
    if (!userContext) router.push('/');
  }, [router, userContext]);

  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(
    userContext?.sessionId ?? ''
  );

  if (!userContext) return null;

  const countryInfo = getCountryByCode(userContext.countryCode);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header — matches learn page style */}
      <header className="sticky top-0 z-50 flex-shrink-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {userContext.mainConfusion === 'Direct query' ? (
                <button 
                  onClick={() => router.push('/#countries')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                  aria-label="Change Country"
                  title="Change Country"
                >
                  <Image
                    src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                    alt={`Flag of ${userContext.countryName}`}
                    width={80}
                    height={50}
                    unoptimized
                    className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0"
                  />
                  <span className="text-sm font-bold text-white tracking-tight leading-none whitespace-nowrap group-hover:text-blue-300 transition-colors">
                    <TranslatedText text={userContext.countryName} />
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Image
                    src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                    alt={`Flag of ${userContext.countryName}`}
                    width={80}
                    height={50}
                    unoptimized
                    className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0"
                  />
                  <span className="text-sm font-bold text-white tracking-tight leading-none whitespace-nowrap">
                    <TranslatedText text={userContext.countryName} />
                  </span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <KnowledgeMeter level={userContext.knowledgeLevel} compact />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

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
      <div className="flex-1 min-h-0 overflow-hidden max-w-4xl w-full mx-auto px-4 sm:px-6">
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
    </div>
  );
}
