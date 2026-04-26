'use client';

/**
 * Assessment page — 3-question diagnostic flow.
 * Determines user knowledge level and builds personalized path.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DiagnosticQuestion from '@/components/Assessment/DiagnosticQuestion';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import { useAssessment } from '@/hooks/useAssessment';
import { useProgress } from '@/hooks/useProgress';
import { useTTS } from '@/hooks/useTTS';
import { useTranslation } from '@/hooks/useTranslation';
import type { Country } from '@/types';

/** Three-step diagnostic assessment page */
export default function AssessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = sessionStorage.getItem('ballotiq_country');
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountry(JSON.parse(stored) as Country);
    } else {
      router.push('/');
    }
  }, [router]);

  const { sessionId } = useProgress('', 'beginner');

  if (!mounted || !country) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return <AssessmentFlow country={country} sessionId={sessionId} />;
}

function AssessmentFlow({ country, sessionId }: { country: Country; sessionId: string }) {
  const router = useRouter();
  const {
    phase, currentQuestion, isAnalyzing, userContext, answerQuestion, goBack,
  } = useAssessment(country.code, country.name, sessionId);
  
  const { resetProgress } = useProgress(
    country.code, 
    userContext?.knowledgeLevel ?? 'beginner'
  );
  const { language } = useTranslation();
  const { isSpeaking, currentText, toggle: toggleTTS } = useTTS(language, sessionId);

  useEffect(() => {
    if (phase === 'complete' && userContext) {
      sessionStorage.setItem('ballotiq_context', JSON.stringify(userContext));
      resetProgress(); // CLEAR OLD DATA
      const timer = setTimeout(() => {
        router.push(`/learn/${country.code.toLowerCase()}/`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, userContext, router, country.code]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={currentQuestion === 0 ? () => router.push('/') : goBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label={currentQuestion === 0 ? 'Back to home' : 'Previous question'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <img 
            src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`} 
            alt="" 
            className="w-6 h-4 object-cover rounded-sm shadow-sm"
          />
          <span className="text-sm text-gray-400">{country.name}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= currentQuestion ? 'bg-blue-500' : 'bg-white/10'
            }`} role="presentation" />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Question {currentQuestion + 1} of 3
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {phase === 'analyzing' || isAnalyzing ? (
            <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🧠 Analyzing your profile...</h2>
                <p className="text-gray-400">BallotIQ is personalizing your learning path</p>
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          ) : phase === 'complete' && userContext ? (
            <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="text-5xl">✨</div>
              <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
              <KnowledgeMeter level={userContext.knowledgeLevel} />
              <p className="text-gray-400">Redirecting to your personalized learning path...</p>
            </div>
          ) : (
            <DiagnosticQuestion
              questionNumber={(currentQuestion + 1) as 1 | 2 | 3}
              onAnswer={answerQuestion}
              isLoading={isAnalyzing}
              onSpeak={toggleTTS}
              isSpeaking={isSpeaking}
              currentText={currentText}
            />
          )}
        </div>
      </div>
    </div>
  );
}
