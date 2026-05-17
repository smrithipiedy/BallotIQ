'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MessageSquare, Map, Mic, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TranslatedText from '@/components/ui/TranslatedText';
import LanguageSelector from '@/components/ui/LanguageSelector';
import type { Country, UserContext } from '@/types';

export default function ChoosePathPage() {
  const router = useRouter();
  const [selectedCountry] = useState<Country | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('ballotiq_country');
    return stored ? (JSON.parse(stored) as Country) : null;
  });
  const [isReady] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    if (!selectedCountry && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [selectedCountry, router]);

  const startGuidedPath = () => {
    router.push('/assess');
  };

  const startOpenChat = () => {
    if (!selectedCountry) return;
    
    const context: UserContext = {
      sessionId: `chat_${Date.now()}`,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      hasVotedBefore: null,
      selfRatedKnowledge: 1,
      mainConfusion: 'Direct query',
      knowledgeLevel: 'beginner',
      language: 'en',
      adaptationActive: false,
      consecutiveErrors: 0,
    };
    
    sessionStorage.setItem('ballotiq_context', JSON.stringify(context));
    router.push('/assistant');
  };

  if (!isReady || !selectedCountry) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden bg-grain">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" onClick={() => router.push('/#country-selection')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                <TranslatedText text="Back" />
             </Button>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">B</div>
             <span className="text-xl font-bold text-white tracking-tighter font-heading">BallotIQ</span>
          </div>
          <LanguageSelector />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-5xl w-full space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/10 mx-auto">
              <Image
                src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                alt={selectedCountry.name}
                width={24}
                height={16}
                unoptimized
                className="object-cover rounded-sm shadow-sm"
              />
              <span className="text-sm font-bold text-white">{selectedCountry.name}</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-heading">
              <TranslatedText text="Select your experience" />
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <TranslatedText text="Choose how you'd like to prepare for the upcoming election. Our AI adapts to either path." />
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Assistant Path */}
            <Card variant="bento" className="p-1 group relative overflow-hidden h-[500px]">
               <div className="h-full p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-500">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white font-heading tracking-tight">AI Assistant</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Instant answers to your specific questions. Just like talking to an expert, available 24/7 in your language.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ul className="space-y-3 text-sm text-white/70">
                       <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Personalized responses</li>
                       <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Real-time election data</li>
                       <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Voice & Text support</li>
                    </ul>
                    <Button variant="primary" size="lg" className="w-full" onClick={startOpenChat}>
                       <TranslatedText text="Start Chatting" />
                       <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
               </div>
               {/* Visual Flourish */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            </Card>

            {/* Guided Path */}
            <Card variant="bento" className="p-1 group relative overflow-hidden h-[500px] border-white/5 bg-white/[0.02]">
               <div className="h-full p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Map className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white font-heading tracking-tight">Guided Journey</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        A structured curriculum covering everything from voter registration to understanding policy differences.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ul className="space-y-3 text-sm text-white/70">
                       <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-white/40" /> Progressive modules</li>
                       <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-white/40" /> Knowledge check quizzes</li>
                       <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-white/40" /> Verified certification</li>
                    </ul>
                    <Button variant="outline" size="lg" className="w-full" onClick={startGuidedPath}>
                       <TranslatedText text="Explore Curriculum" />
                       <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
               </div>
            </Card>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 pt-8"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Safe & Anonymous</p>
            <div className="flex gap-8 opacity-20">
               <Shield className="w-6 h-6" />
               <Users className="w-6 h-6" />
               <Zap className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
