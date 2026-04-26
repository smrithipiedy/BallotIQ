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
import { useTranslation } from '@/hooks/useTranslation';
import { getFallbackGuide } from '@/lib/gemini/fallback';
import ChatWindow from '@/components/Assistant/ChatWindow';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import TranslatedText from '@/components/ui/TranslatedText';
import { getCountryByCode } from '@/lib/constants/countries';
import type { ElectionStep } from '@/types';

/** Full-page AI assistant with context-aware responses */
export default function AssistantPage() {
  const router = useRouter();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [completedSteps, setCompletedSteps] = useState<ElectionStep[]>([]);
  const { language } = useTranslation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      if (stored) {
        const ctx = JSON.parse(stored) as UserContext;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserContext(ctx);
        const fallback = getFallbackGuide(ctx.countryCode, ctx.knowledgeLevel);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedSteps(fallback ?? []);
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const isOpenChat = userContext?.mainConfusion === 'Direct query';

  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(
    language,
    userContext?.sessionId ?? ''
  );

  if (!userContext) return null;

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex-shrink-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <img 
                  src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`} 
                  alt="" 
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-semibold text-white tracking-tight leading-none whitespace-nowrap">
                  <TranslatedText text={userContext.countryName} />
                </span>
              </div>
              {!isOpenChat && (
                <div className="hidden sm:block">
                  <KnowledgeMeter level={userContext.knowledgeLevel} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-blue-400/80">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <TranslatedText text="BallotIQ AI Active" />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="flex-shrink-0 px-4 py-2 bg-amber-500/5 border-b border-amber-500/10">
        <p className="text-[11px] text-amber-400/80 text-center max-w-2xl mx-auto">
          <TranslatedText text="BallotIQ provides educational information only. For official guidance, visit" />{' '}
          <a
            href={getCountryByCode(userContext.countryCode)?.electionBodyUrl || `https://www.google.com/search?q=${userContext.countryName}+election+commission`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-300 font-bold"
          >
            <TranslatedText text={getCountryByCode(userContext.countryCode)?.electionBody || "your official election body"} />
          </a>.
        </p>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden max-w-4xl w-full mx-auto">
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
