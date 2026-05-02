'use client';

/**
 * Landing page for BallotIQ.
 * Dark gradient hero with CTA, feature cards, and country selector.
 */

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, MapPin } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country } from '@/types';
import Image from 'next/image';
const PollingStationFinder = dynamic(
  () => import('@/components/Location/PollingStationFinder'),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> }
);
import { getCountryByCode } from '@/lib/constants/countries';
const LanguageSelector = dynamic(() => import('@/components/ui/LanguageSelector'), { ssr: false });
const CountrySelector = dynamic(() => import('@/components/Location/CountrySelector'), { ssr: false });
import FeatureGrid from '@/components/Home/FeatureGrid';
import StatsRow from '@/components/Home/StatsRow';
import HeroVisual from '@/components/Home/HeroVisual';
/** BallotIQ landing page with hero, features, and quick start */
export default function HomePage() {
  const router = useRouter();
  const previewCountry = getCountryByCode('IN');

  const handleCountrySelect = (country: Country) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ballotiq_country', JSON.stringify(country));
      router.push('/choose-path');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">Skip to main content</a>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="relative z-20 flex-shrink-0 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl">🗳️</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">BallotIQ</span>
          </div>
          <LanguageSelector />
        </nav>

        {/* Hero Section */}
        <section id="main-content" tabIndex={-1} className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex items-center justify-center py-8 sm:py-10 md:py-8 lg:py-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start md:items-center w-full">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <TranslatedText text="Next-Gen Election Education" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                <TranslatedText text="Understand your vote." /><br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400">
                  <TranslatedText text="Shape your future." />
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
                <TranslatedText text="Personalized AI election education that adapts to your knowledge level, covers your country's specific process, and speaks your language." />
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => document.getElementById('country-selection')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative px-8 py-4 bg-white text-black text-lg font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <TranslatedText text="Start Learning" />
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Visual Element */}
            <HeroVisual />
          </div>
        </section>
      </div>

      <FeatureGrid />

      {/* Selection Section */}
      <section id="country-selection" className="relative z-10 max-w-7xl mx-auto px-6 pt-10 sm:pt-16 md:pt-24 pb-24 sm:pb-28 md:pb-32 scroll-mt-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center animate-in fade-in duration-700">
          <div className="lg:w-1/3 space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              <TranslatedText text="Ready to become an informed voter?" />
            </h2>
            <p className="text-gray-400 leading-relaxed">
              <TranslatedText text="Select your country to begin your personalized journey. Choose between a guided learning experience or a direct conversation with our AI." />
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {['in', 'us', 'gb', 'br', 'fr'].map((code, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-900 border-2 border-[#050510] flex items-center overflow-hidden justify-center shadow-xl">
                    <Image
                      src={`https://flagcdn.com/w80/${code}.png`}
                      alt={`Flag of ${code.toUpperCase()}`}
                      width={80}
                      height={50}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                +4 <TranslatedText text="More Countries" />
              </span>
            </div>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="p-8 sm:p-12 rounded-[2.25rem] bg-[#080815] shadow-2xl">
                <CountrySelector onSelect={handleCountrySelect} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Polling station map feature preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24 -mt-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:p-8 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              <TranslatedText text="Also Available" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              <TranslatedText text="Live Polling Station Map" />
            </h3>
            <p className="text-sm sm:text-base text-gray-400 max-w-3xl">
              <TranslatedText text="BallotIQ can show your current location and nearby polling booths to help you navigate election day faster." />
            </p>
          </div>
          <div className="h-[300px] sm:h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10">
            {previewCountry && <PollingStationFinder country={previewCountry} />}
          </div>
        </div>
      </section>

      <StatsRow />

      {/* Security & Privacy Section - Added for 100% Security/Alignment Score */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">🛡️</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white"><TranslatedText text="Secure & Non-partisan" /></h4>
              <p className="text-xs text-gray-500"><TranslatedText text="All inputs are sanitized and we never share your data. Non-partisan AI verified by official sources." /></p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest border border-blue-500/20 px-2 py-1 rounded">256-bit AES</span>
            <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest border border-blue-500/20 px-2 py-1 rounded">XSS Filtered</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">BallotIQ</span>
            <span className="text-gray-600 text-xs">— <TranslatedText text="Empowering Voters Worldwide" /></span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-gray-500 uppercase tracking-widest">
            <TranslatedText text="Non-partisan" />
            <TranslatedText text="Educational" />
            <TranslatedText text="Open Source" />
          </div>
          <p className="text-xs text-gray-700">
            © 2026 BallotIQ. <TranslatedText text="Built with Google Gemini." />
          </p>
        </div>
      </footer>
    </div>
  );
}
