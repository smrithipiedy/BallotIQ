'use client';

/**
 * Polling Stations page — dedicated page for finding election offices and voting centers.
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import LanguageSelector from '@/components/ui/LanguageSelector';
import PollingStationFinder from '@/components/Location/PollingStationFinder';
import CountrySelector from '@/components/Location/CountrySelector';
import type { Country } from '@/types';
import { getCountryByCode } from '@/lib/constants/countries';
import Image from 'next/image';

export default function PollingStationsPage() {
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_country');
    if (!stored) return null;
    return JSON.parse(stored) as Country;
  });

  const country = useMemo(() => {
    if (!selectedCountry) return null;
    return getCountryByCode(selectedCountry.code) ?? selectedCountry;
  }, [selectedCountry]);

  const handleCountrySelect = (c: Country) => {
    sessionStorage.setItem('ballotiq_country', JSON.stringify(c));
    setSelectedCountry(c);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-gray-200 selection:bg-blue-500/30 flex flex-col">
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 sticky top-0 shrink-0 bg-[#020817]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-2">
            {country && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
                <Image
                  src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                  alt={`Flag of ${country.name}`}
                  width={80}
                  height={50}
                  unoptimized
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-bold text-white tracking-tight leading-none">
                  {country.name}
                </span>
              </div>
            )}
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Page heading */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                <TranslatedText text="Find Polling Stations" />
              </h1>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              <TranslatedText text="Locate election offices and voting centers near you" />
            </p>
          </div>

          {/* Country selector if no country context */}
          {!country && (
            <div className="bg-blue-950/40 border border-blue-800/30 rounded-xl p-6 space-y-4">
              <p className="text-sm text-gray-300">
                <TranslatedText text="Select your country to find polling stations:" />
              </p>
              <CountrySelector onSelect={handleCountrySelect} />
            </div>
          )}

          {/* Polling station finder */}
          {country && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
              <PollingStationFinder country={country} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
