"use client";

/**
 * Landing page for BallotIQ.
 * Dark gradient hero with CTA, feature cards, and country selector.
 */
import AuthModal from "@/components/Auth/AuthModal";
import { useEffect, useState } from "react";
import { onAuthChange, logout } from "@/lib/firebase/client";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { captureEvent } from "@/lib/posthog/helper";
import { EVENTS } from "@/lib/posthog/events";
import dynamic from "next/dynamic";
import { ArrowRight, MapPin, Menu, X } from "lucide-react";
import TranslatedText from "@/components/ui/TranslatedText";
import { useTranslation } from "@/hooks/useTranslation";
import type { Country } from "@/types";
import Image from "next/image";
const PollingStationFinder = dynamic(
  () => import("@/components/Location/PollingStationFinder"),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" />,
  },
);
import { getCountryByCode } from "@/lib/constants/countries";
const LanguageSelector = dynamic(
  () => import("@/components/ui/LanguageSelector"),
  { ssr: false },
);
import ThemeToggle from "@/components/ui/ThemeToggle";
const CountrySelector = dynamic(
  () => import("@/components/Location/CountrySelector"),
  { ssr: false },
);
import FeatureGrid from "@/components/Home/FeatureGrid";
import StatsRow from "@/components/Home/StatsRow";
import HeroVisual from "@/components/Home/HeroVisual";
import TestimonialCarousel from "@/components/Home/TestimonialCarousel";

/** BallotIQ landing page with hero, features, and quick start */
export default function HomePage() {
  const router = useRouter();
  const { language } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const previewCountry = getCountryByCode("IN");
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  const handleCountrySelect = (country: Country) => {
    if (typeof window !== "undefined") {
      captureEvent(EVENTS.COUNTRY_SELECTED, { country_code: country.code, country_name: country.name });
      sessionStorage.setItem("ballotiq_country", JSON.stringify(country));
      router.push("/choose-path");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      <div className="min-h-screen flex flex-col relative">
        {/* Navigation */}
        <nav className="relative z-20 flex-shrink-0 flex items-center justify-between px-6 py-3 sm:py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl">🗳️</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              BallotIQ
            </span>
          </div>

          {/* Desktop right-aligned navbar with rounded corners */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 p-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full shadow-lg shadow-black/20 pl-4 pr-4 sm:pl-5 sm:pr-5">
            <a
              href="#country-selection"
              className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/5"
            >
              <TranslatedText text="Countries" />
            </a>
            <a
              href="#live-map"
              className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/5"
            >
              <TranslatedText text="Live Map" />
            </a>
            <div className="border-l border-white/10 h-5 mx-1 sm:mx-2" />
            <ThemeToggle />
            <div className="border-l border-white/10 h-5 mx-1 sm:mx-2" />
            <LanguageSelector />
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm font-semibold text-green-400 px-3 sm:px-4 py-2">
                  {user.displayName || user.email}
                </div>

                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors px-3 sm:px-4 py-2 rounded-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 sm:px-4 py-2 rounded-full"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-gray-400 hover:text-white focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-20 left-6 right-6 z-30 p-5 rounded-2xl bg-[#080815]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4">
              <a
                href="#country-selection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-white/5"
              >
                <TranslatedText text="Countries" />
              </a>
              <a
                href="#live-map"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-white/5"
              >
                <TranslatedText text="Live Map" />
              </a>
              <div className="border-t border-white/5 my-2" />
              <div className="flex justify-between items-center px-3">
                <span className="text-xs text-gray-400 font-medium">
                  <TranslatedText text="Theme" />
                </span>
                <ThemeToggle />
              </div>
              <div className="border-t border-white/5 my-2" />
              <div className="flex justify-between items-center px-3">
                <span className="text-xs text-gray-400 font-medium">
                  <TranslatedText text="Language" />
                </span>
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section
          id="main-content"
          tabIndex={-1}
          className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex items-center justify-center py-6 sm:py-8 md:py-6 lg:py-4 outline-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start md:items-center w-full">
            {/* Left Content */}
            <div className="space-y-5 sm:space-y-6 animate-in slide-in-from-left-8 duration-1000 max-w-xl lg:max-w-[480px] xl:max-w-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <TranslatedText text="Next-Gen Election Education" />
              </div>

              <h1
                className={`font-black text-white tracking-tighter font-heading ${
                  language === "ta" || language === "te"
                    ? "text-3xl sm:text-4xl lg:text-[3.25rem] leading-[1.25]"
                    : language === "hi"
                      ? "text-3xl sm:text-4xl lg:text-[3.75rem] leading-[1.25]"
                      : "text-[2.75rem] sm:text-5xl lg:text-[4.5rem] leading-[0.95]"
                }`}
              >
                <TranslatedText text="Understand your vote." />
                <br />
                <span className="text-primary-gradient">
                  <TranslatedText text="Shape your future." />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-normal">
                <TranslatedText text="Personalized AI election education that adapts to your knowledge level, covers your country's specific process, and speaks your language." />
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("country-selection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group relative px-7 py-3.5 bg-white text-black text-base font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
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
      <section
        id="country-selection"
        className="relative z-10 max-w-7xl mx-auto px-6 pt-10 sm:pt-16 md:pt-24 pb-24 sm:pb-28 md:pb-32 scroll-mt-20"
      >
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
                {["in", "us", "gb", "br", "fr"].map((code, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gray-900 border-2 border-[#050510] flex items-center overflow-hidden justify-center shadow-xl"
                  >
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
      <section
        id="live-map"
        className="relative z-10 max-w-7xl mx-auto px-6 pb-24 -mt-16 scroll-mt-20"
      >
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
            {previewCountry && (
              <PollingStationFinder country={previewCountry} />
            )}
          </div>
        </div>
      </section>

      <TestimonialCarousel />

      <StatsRow />

      {/* Security & Privacy Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">🛡️</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                <TranslatedText text="Secure & Non-partisan" />
              </h4>
              <p className="text-xs text-gray-500">
                <TranslatedText text="All inputs are sanitized and we never share your data. Non-partisan AI verified by official sources." />
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest border border-blue-500/20 px-2 py-1 rounded">
              256-bit AES
            </span>
            <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest border border-blue-500/20 px-2 py-1 rounded">
              XSS Filtered
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 dark:bg-gradient-to-br dark:from-gray-950 dark:via-blue-950 dark:to-gray-950 bg-gray-50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid - 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pb-8 lg:pb-10 border-b border-white/5 dark:border-white/5 border-gray-200">
            {/* Column 1: Brand - Left */}
            <div className="space-y-3 lg:space-y-4 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                  <span className="text-sm">🗳️</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  BallotIQ
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto sm:mx-0">
                <TranslatedText text="Empowering Voters Worldwide" />
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © 2026 BallotIQ.{" "}
                <TranslatedText text="Built with Google Gemini." />
              </p>
            </div>

            {/* Column 2: Platform Values - Centered */}
            <div className="space-y-3 lg:space-y-4 text-center">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <TranslatedText text="Platform Values" />
              </h4>
              <div className="flex flex-wrap gap-2 lg:gap-3 justify-center">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200">
                  <TranslatedText text="Non-partisan" />
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200">
                  <TranslatedText text="Educational" />
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200">
                  <TranslatedText text="Open Source" />
                </span>
              </div>
            </div>

            {/* Column 3: Explore - Centered */}
            <div className="space-y-3 lg:space-y-4 text-center">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <TranslatedText text="Explore" />
              </h4>
              <div className="flex flex-wrap gap-3 lg:gap-4 justify-center">
                <a
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-200"
                >
                  <TranslatedText text="About" />
                </a>
                <a
                  href="/privacy-policy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-200"
                >
                  <TranslatedText text="Privacy Policy" />
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-200"
                >
                  <TranslatedText text="Contact" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center sm:text-left">
              <TranslatedText text="Made with care for better civic engagement" />
            </p>
            <div className="flex gap-4 lg:gap-6 text-[10px] font-medium uppercase tracking-widest flex-wrap justify-center">
              <span className="text-blue-500/80 dark:text-blue-400/60">
                Secure
              </span>
              <span className="text-green-500/80 dark:text-green-400/60">
                Non-partisan
              </span>
              <span className="text-purple-500/80 dark:text-purple-400/60">
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
