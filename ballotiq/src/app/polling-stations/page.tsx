'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { getCountryByCode } from '@/lib/constants/countries';
import type { UserContext } from '@/types';

const PollingStationFinder = dynamic(
  () => import('@/components/Location/PollingStationFinder'),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> }
);
import LanguageSelector from '@/components/ui/LanguageSelector';
import TranslatedText from '@/components/ui/TranslatedText';
import BottomNav from '@/components/ui/BottomNav';

export default function PollingStationsPage() {
  const router = useRouter();
  const [userContext] = useState<UserContext | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      return stored ? JSON.parse(stored) as UserContext : null;
    }
    return null;
  });

  useEffect(() => {
    if (!userContext && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ballotiq_context');
      if (!stored) {
        router.push('/');
      }
    }
  }, [router, userContext]);

  if (!userContext) return null;

  const country = getCountryByCode(userContext.countryCode);

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-hidden flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">Skip to main content</a>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">
              <TranslatedText text="Polling Stations" />
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Full-screen map area (minus header and bottom nav) */}
      <div id="main-content" tabIndex={-1} className="flex-1 min-h-0 w-full pb-20 md:pb-0 outline-none">
        <div className="h-full w-full relative">
          {country && <PollingStationFinder country={country} fullScreen />}
        </div>
      </div>

      <BottomNav activeTab="polling" countryCode={userContext.countryCode} />
    </div>
  );
}
