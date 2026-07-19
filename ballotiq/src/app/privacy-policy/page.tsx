import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Database, Share2, Clock, UserCheck, Mail } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * Privacy Policy page for BallotIQ (issue #135).
 * Server component (no client hooks needed) explaining what data is
 * collected, which third-party services are used, retention periods,
 * and user rights. Matches the dark navy theme + blue/green/purple
 * accent styling used across the About page and site footer.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 relative overflow-x-hidden">

      {/* Ambient background glow orbs, matching about/not-found/choose-path styling */}
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
            <TranslatedText text="Privacy Policy" />
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <TranslatedText text="We collect the minimum data needed to help you understand elections and voting, and we're transparent about how it's used." />
          </p>
          <p className="text-xs text-gray-500">
            <TranslatedText text="Last updated: July 2026" />
          </p>
        </header>

        {/* Data We Collect */}
        <section className="mb-8 sm:mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Data We Collect" />
            </h2>
          </div>
          <ul className="space-y-3 text-sm sm:text-base text-gray-400 leading-relaxed list-disc list-inside">
            <li>
              <TranslatedText text="Anonymous session data — created via Firebase Auth anonymous sign-in, used to keep your progress without requiring an account." />
            </li>
            <li>
              <TranslatedText text="Chat history — your conversations with the AI assistant, stored in Firestore so you can pick up where you left off." />
            </li>
            <li>
              <TranslatedText text="Quiz progress — your answers and completion status for Guided Path lessons." />
            </li>
            <li>
              <TranslatedText text="Location data — only if you choose to share it, used via the Google Maps API to help you find nearby polling stations. This is never stored beyond your active session." />
            </li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section className="mb-8 sm:mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Third-Party Services" />
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-5">
            <TranslatedText text="BallotIQ relies on the following Google services to operate. Each processes a limited slice of your data solely to power the related feature." />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-blue-300 mb-1">Firebase</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                <TranslatedText text="Authentication and Firestore database for session and chat storage." />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-indigo-300 mb-1">Gemini API</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                <TranslatedText text="Powers the AI assistant that answers your questions and generates guides." />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-green-300 mb-1">Google Cloud Translation / TTS</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                <TranslatedText text="Translates content and reads it aloud in your preferred language." />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-purple-300 mb-1">Google Maps API</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                <TranslatedText text="Helps locate nearby polling stations when you share your location." />
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-8 sm:mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Data Retention" />
            </h2>
          </div>
          <ul className="space-y-3 text-sm sm:text-base text-gray-400 leading-relaxed list-disc list-inside">
            <li>
              <TranslatedText text="Generated country guides are cached for 24 hours to keep answers fast and reduce redundant AI calls." />
            </li>
            <li>
              <TranslatedText text="Chat history and quiz progress are kept as long as your anonymous session remains active, so you can resume later on the same device." />
            </li>
            <li>
              <TranslatedText text="Location data is used only in the moment you request it and is not retained." />
            </li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className="mb-8 sm:mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Your Rights" />
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            <TranslatedText text="You can clear your session data at any time by clearing your browser storage or starting a new anonymous session. Since we don't collect personal identifiers, most data is tied only to your device's anonymous session and is not linked to your real identity. If you have questions about your data or would like something removed, reach out using the contact details below." />
          </p>
        </section>

        {/* Contact */}
        <section className="mb-4 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="Contact Us" />
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            <TranslatedText text="Have questions about this policy or how your data is handled? Open an issue on our GitHub repository and we'll get back to you." />
          </p>
        </section>

        {/* Bottom accent bar, matching about page's Secure / Non-partisan / AI Powered strip */}
        <div className="pt-8 sm:pt-10 flex flex-wrap justify-center gap-4 lg:gap-6 text-[10px] font-medium uppercase tracking-widest">
          <span className="text-blue-400/70 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure
          </span>
          <span className="text-green-400/70">Non-partisan</span>
          <span className="text-purple-400/70">AI Powered</span>
        </div>
      </main>
    </div>
  );
}