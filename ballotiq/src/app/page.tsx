'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Zap, BookOpen, MapPin, Users } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TranslatedText from '@/components/ui/TranslatedText';
import type { Country } from '@/types';
import { getCountryByCode } from '@/lib/constants/countries';

const LanguageSelector = dynamic(() => import('@/components/ui/LanguageSelector'), { ssr: false });
const CountrySelector = dynamic(() => import('@/components/Location/CountrySelector'), { ssr: false });
const HeroVisual = dynamic(() => import('@/components/Home/HeroVisual'), { ssr: false });

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
    <div className="relative min-h-screen selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🗳️</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-heading">BallotIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
              <a href="#mission" className="hover:text-white transition-colors">Our Mission</a>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <TranslatedText text="Revolutionizing Civic Tech" />
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] font-heading">
                Understand your vote.<br />
                <span className="text-primary-gradient">Shape your future.</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                <TranslatedText text="Personalized AI election education that adapts to your knowledge level, covers your country's specific process, and speaks your language." />
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="xl" onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}>
                  <TranslatedText text="Start Learning" />
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="glass" size="xl">
                  <TranslatedText text="View Demo" />
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold">10,000+ Voters</p>
                  <p className="text-muted-foreground text-xs">Joined the revolution this week</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square lg:aspect-auto h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
              <Image 
                src="/ballotiq_hero_visual.png" 
                alt="BallotIQ Futuristic Visual" 
                width={800} 
                height={800} 
                className="relative z-10 w-full h-auto object-contain animate-float"
              />
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-32 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-white font-heading">Engineered for Transparency.</h2>
              <p className="text-muted-foreground text-lg">Every feature is designed to empower you with unbiased, factual, and accessible election information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Large */}
              <Card variant="bento" className="md:col-span-2 h-[400px] group">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white"><TranslatedText text="Adaptive Learning Engine" /></h3>
                    <p className="text-muted-foreground text-lg max-w-md"><TranslatedText text="Our AI analyzes your current knowledge and tailors the curriculum in real-time. No more generic explanations—just what you need to know." /></p>
                  </div>
                  <div className="relative h-32 w-full mt-4 bg-white/5 rounded-2xl overflow-hidden p-4">
                     <div className="flex gap-4">
                        <div className="h-24 w-1/3 bg-indigo-500/20 rounded-xl animate-pulse" />
                        <div className="h-24 w-2/3 bg-white/5 rounded-xl border border-white/10" />
                     </div>
                  </div>
                </div>
              </Card>

              {/* Feature 2: Square */}
              <Card variant="bento" className="h-[400px]">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white"><TranslatedText text="Global Scale" /></h3>
                    <p className="text-muted-foreground text-base"><TranslatedText text="Supporting over 190 countries with localized election rules, dates, and candidate information." /></p>
                  </div>
                  <div className="flex justify-center pt-8 opacity-40">
                    <Globe className="w-24 h-24 text-white" />
                  </div>
                </div>
              </Card>

              {/* Feature 3: Square */}
              <Card variant="bento" className="h-[400px]">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white"><TranslatedText text="Non-Partisan Verified" /></h3>
                    <p className="text-muted-foreground text-base"><TranslatedText text="AI-driven content cross-referenced with official governmental and international election monitor data." /></p>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                     <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-tighter uppercase">Verified API</div>
                     <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-tighter uppercase">AES-256</div>
                  </div>
                </div>
              </Card>

              {/* Feature 4: Large */}
              <Card variant="bento" className="md:col-span-2 h-[400px]">
                 <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-8">
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="text-3xl font-bold text-white"><TranslatedText text="Community Polling" /></h3>
                      <p className="text-muted-foreground text-lg"><TranslatedText text="Find your nearest polling station and see real-time wait times reported by other BallotIQ users." /></p>
                      <Button variant="outline" className="w-fit">Explore Maps</Button>
                    </div>
                    <div className="relative bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden flex items-center justify-center">
                       <MapPin className="w-24 h-24 text-indigo-500/30" />
                       <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-red-500 animate-ping" />
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="get-started" className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl sm:text-7xl font-black text-white font-heading tracking-tight leading-none">
              Ready to meet your<br />
              <span className="text-primary-gradient">Civic Future?</span>
            </h2>
            
            <div className="p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="p-8 sm:p-16 rounded-[2.8rem] bg-card shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
                
                <div className="relative z-10 space-y-8">
                  <p className="text-xl text-muted-foreground">Select your region to begin your personalized journey.</p>
                  <CountrySelector onSelect={handleCountrySelect} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="security" className="py-20 px-6 border-t border-white/5">
           <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-2xl font-bold text-white"><Shield className="w-8 h-8" /> SECURE</div>
              <div className="flex items-center gap-2 text-2xl font-bold text-white"><Users className="w-8 h-8" /> PRIVACY</div>
              <div className="flex items-center gap-2 text-2xl font-bold text-white"><Globe className="w-8 h-8" /> OPEN-SOURCE</div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-white/5 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">B</div>
              <span className="text-2xl font-bold text-white tracking-tighter">BallotIQ</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Empowering the next generation of voters with AI-driven, personalized civic education. Non-partisan, factual, and free for everyone.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Learning Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Polling Maps</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Project</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Mission</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Open Source</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 BallotIQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Built with Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
