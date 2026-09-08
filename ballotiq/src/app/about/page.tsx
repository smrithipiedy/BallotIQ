import Link from 'next/link';
import { ArrowLeft, MapPin, MessageSquare, ShieldCheck, Sparkles, Languages } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * About page for BallotIQ (issue #134).
 * Server component (no client hooks needed) explaining what the platform
 * does, its non-partisan mission, and the Google services powering it.
 * Matches the dark navy theme + blue/green/purple accent badges used
 * in the site footer.
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 relative overflow-x-hidden">

      {/* Ambient background glow orbs, matching not-found/choose-path styling */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline text-sm font-semibold">
            <TranslatedText text="Back to Home" />
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main
        id="main-content"
        className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        {/* Header */}
        <header className="text-center space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-2xl" role="img" aria-label="BallotIQ logo">🗳️</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ballot<span className="text-blue-400">IQ</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            <TranslatedText text="About BallotIQ" />
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <TranslatedText text="An AI-powered, non-partisan platform helping citizens understand elections, their rights, and the voting process." />
          </p>
        </header>

        {/* Non-partisan mission statement */}
        <section className="mb-10 sm:mb-14 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Our Mission" />
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            <TranslatedText text="BallotIQ is strictly non-partisan. We don't endorse candidates, parties, or positions. Our only goal is civic education: helping every voter understand how elections work in their country, what their rights are, and how to participate with confidence. All content is factual, balanced, and sourced with that neutrality in mind." />
          </p>
        </section>

        {/* What BallotIQ does — Guided Path + Open Chat */}
        <section className="mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            <TranslatedText text="How BallotIQ Works" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                <TranslatedText text="Guided Path" />
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                <TranslatedText text="Structured, step-by-step lessons tailored to your country, with micro-quizzes and progress tracking to build voting confidence at your own pace." />
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                <TranslatedText text="Open Chat" />
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                <TranslatedText text="Prefer to just ask questions? Talk directly with our AI assistant in natural language and get clear, conversational answers anytime." />
              </p>
            </div>
          </div>
        </section>

        {/* Powered by Google services */}
        <section className="mb-4 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Powered by Google" />
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-5">
            <TranslatedText text="BallotIQ is built on Google's platform to keep answers accurate, secure, and accessible in your language." />
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs sm:text-sm text-blue-300">
              <Sparkles className="w-3.5 h-3.5" /> Gemini
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-xs sm:text-sm text-green-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Firebase
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-xs sm:text-sm text-purple-300">
              <Languages className="w-3.5 h-3.5" /> Translation
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs sm:text-sm text-indigo-300">
              <MessageSquare className="w-3.5 h-3.5" /> Text-to-Speech
            </span>
          </div>
        </section>

        {/* Bottom accent bar, matching footer's Secure / Non-partisan / AI Powered strip */}
        <div className="pt-8 sm:pt-10 flex flex-wrap justify-center gap-4 lg:gap-6 text-[10px] font-medium uppercase tracking-widest">
          <span className="text-blue-400/70"><TranslatedText text="Secure" /></span>
          <span className="text-green-400/70"><TranslatedText text="Non-partisan" /></span>
          <span className="text-purple-400/70"><TranslatedText text="AI Powered" /></span>
        </div>
      </main>
    </div>
  );
}