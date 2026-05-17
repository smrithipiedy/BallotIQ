'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Shield, Info } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TranslatedText from '@/components/ui/TranslatedText';
import LanguageSelector from '@/components/ui/LanguageSelector';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ChatWindow from '@/components/Assistant/ChatWindow';
import BottomNav from '@/components/ui/BottomNav';

import type { UserContext, ElectionStep } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { getFallbackGuide } from '@/lib/gemini/fallback';
import { getCountryByCode } from '@/lib/constants/countries';

export default function AssistantPage() {
  const router = useRouter();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('ballotiq_context');
    if (!stored) {
      router.push('/');
      return;
    }

    const ctx = JSON.parse(stored) as UserContext;
    if (!ctx.electionBody || !ctx.electionBodyUrl) {
      const countryData = getCountryByCode(ctx.countryCode);
      if (countryData) {
        ctx.electionBody = countryData.electionBody;
        ctx.electionBodyUrl = countryData.electionBodyUrl;
        sessionStorage.setItem('ballotiq_context', JSON.stringify(ctx));
      }
    }
    setUserContext(ctx);
    setMounted(true);
  }, [router]);

  const completedSteps = useMemo<ElectionStep[]>(() => {
    if (!userContext) return [];
    return getFallbackGuide(userContext.countryCode, userContext.knowledgeLevel) ?? [];
  }, [userContext]);

  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(
    userContext?.sessionId ?? ''
  );

  if (!mounted || !userContext) return null;

  const countryInfo = getCountryByCode(userContext.countryCode);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grain selection:bg-indigo-500/30 overflow-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">B</div>
             <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none font-heading">AI Assistant</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Context: {userContext.countryName}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
              <Image
                src={`https://flagcdn.com/w80/${userContext.countryCode.toLowerCase()}.png`}
                alt={userContext.countryName}
                width={20}
                height={14}
                unoptimized
                className="object-cover rounded-sm"
              />
              <span className="text-xs font-bold text-white tracking-tight">{userContext.countryName}</span>
              <div className="w-px h-3 bg-white/10 mx-1" />
              <KnowledgeMeter level={userContext.knowledgeLevel} compact />
           </div>
           
           <Button variant="glass" size="sm" onClick={() => router.push('/polling-stations')}>
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Stations</span>
           </Button>
           
           <LanguageSelector />
        </div>
      </nav>

      {/* Warning/Disclaimer bar */}
      <div className="bg-indigo-500/5 border-b border-indigo-500/10 px-4 py-2">
         <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
            <Info className="w-3 h-3 text-indigo-400" />
            <p className="text-[10px] sm:text-[11px] text-indigo-300/80">
              Educational information only. Visit <a href={countryInfo?.electionBodyUrl} target="_blank" className="font-bold underline hover:text-indigo-200">{countryInfo?.electionBody || 'Official Site'}</a> for legal guidance.
            </p>
         </div>
      </div>

      <main className="flex-1 flex flex-col relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6">
        <ErrorBoundary componentName="AssistantPage">
          <ChatWindow
            userContext={userContext}
            completedSteps={completedSteps}
            isSpeaking={isSpeaking}
            currentSpokenText={currentText}
            onSpeak={toggleTTS}
          />
        </ErrorBoundary>
      </main>

      <div className="md:hidden">
         <BottomNav activeTab="assistant" countryCode={userContext.countryCode} />
      </div>
    </div>
  );
}
