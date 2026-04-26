'use client';

/**
 * Landing page for BallotIQ.
 * Dark gradient hero with CTA, feature cards, and country selector.
 */

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, Brain, Globe, Languages, Accessibility, LayoutGrid, Map } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country } from '@/types';

const LanguageSelector = dynamic(() => import('@/components/ui/LanguageSelector'), { ssr: false });
const CountrySelector = dynamic(() => import('@/components/Location/CountrySelector'), { ssr: false });

/** BallotIQ landing page with hero, features, and quick start */
export default function HomePage() {
  const router = useRouter();

  const handleCountrySelect = (country: Country) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ballotiq_country', JSON.stringify(country));
      router.push('/choose-path/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-grey-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">🗳️</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">BallotIQ</span>
        </div>
        <LanguageSelector />
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 h-[calc(100vh-88px)] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <TranslatedText text="Next-Gen Election Education" />
            </div>

            <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-[1.05]">
              <TranslatedText text="Understand your vote." /><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400">
                <TranslatedText text="Shape your future." />
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
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
          <div className="relative h-[420px] hidden lg:block animate-in slide-in-from-right-8 duration-1000">
            {/* Adaptive Learning Card */}
            <div className="absolute -top-6 -right-6 w-[280px] p-5 rounded-[2rem] bg-[#0A0A1F] border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 z-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm"><TranslatedText text="Adaptive Path" /></h4>
                  <p className="text-blue-400 text-[10px] font-medium tracking-widest uppercase"><TranslatedText text="Level: Beginner" /></p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-blue-500 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                  <span>2/5 <TranslatedText text="Steps" /></span>
                  <span>40% <TranslatedText text="Knowledge" /></span>
                </div>
              </div>
            </div>

            {/* AI Conversation Component - NEW */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] p-6 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest"><TranslatedText text="BallotIQ Assistant" /></span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-[10px] text-gray-300 leading-relaxed">
                    <TranslatedText text="How do I register to vote in France?" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-blue-600 text-[10px] text-white leading-relaxed shadow-lg shadow-blue-500/20">
                    <TranslatedText text="You can register online via service-public.fr or at your local town hall (mairie)..." />
                  </div>
                </div>
              </div>
              <div className="mt-2 h-10 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                <div className="h-1.5 w-24 bg-gray-600 rounded-full" />
                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* AI Assistant Bubble (Small Accent) */}
            <div className="absolute bottom-4 left-0 w-[240px] p-5 rounded-[2rem] bg-indigo-600 border border-indigo-400/30 shadow-2xl -rotate-6 hover:rotate-0 transition-all duration-500 z-30">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <p className="text-white text-[10px] leading-relaxed font-medium">
                  <TranslatedText text="I've translated this guide into French for you." />
                </p>
              </div>
            </div>

            {/* Background Decorative Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 blur-[100px] rounded-full z-0" />
            
            {/* Grid Line Visual */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] rounded-[2.5rem] border border-white/5" />
          </div>
        </div>
      </section>

      {/* Feature Infinite Carousel */}
      <section className="relative z-10 py-16 overflow-hidden bg-white/[0.01] border-y border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4 px-2">
              {[
                { icon: LayoutGrid, title: 'Dual Modes', desc: 'Structured lessons or direct AI conversation', color: 'bg-indigo-500' },
                { icon: Brain, title: 'Adaptive AI', desc: 'Content that grows with your knowledge level', color: 'bg-purple-500' },
                { icon: Globe, title: 'Regional Specific', desc: "Deep guides for your country's unique rules", color: 'bg-blue-500' },
                { icon: Languages, title: 'Multi-Language', desc: 'Native translations for 8 global languages', color: 'bg-emerald-500' },
                { icon: Accessibility, title: 'Inclusive', desc: 'Screen reader and keyboard accessibility', color: 'bg-amber-500' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="inline-flex flex-col w-[280px] p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 mx-2">
                  <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-lg shadow-black/20`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2"><TranslatedText text={title} /></h3>
                  <p className="text-gray-500 leading-relaxed text-xs whitespace-normal"><TranslatedText text={desc} /></p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Selection Section */}
      <section id="country-selection" className="relative z-10 max-w-7xl mx-auto px-6 py-32 scroll-mt-20">
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
                    <img
                      src={`https://flagcdn.com/w80/${code}.png`}
                      alt=""
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

      {/* Global Presence */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-xl">8 <span className="text-sm font-medium tracking-widest uppercase">Countries</span></div>
          <div className="flex items-center gap-2 font-bold text-xl">8 <span className="text-sm font-medium tracking-widest uppercase">Languages</span></div>
          <div className="flex items-center gap-2 font-bold text-xl uppercase tracking-tighter">Gemini <span className="text-sm font-medium tracking-widest">AI Core</span></div>
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
