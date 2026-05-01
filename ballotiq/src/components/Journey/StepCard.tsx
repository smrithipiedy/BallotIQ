'use client';

/**
 * Election step card with depth-appropriate content display.
 * - Beginner: detailedExplanation (plain language)
 * - Intermediate/Advanced: detailedExplanation (full depth)
 * - Adaptation mode: simpleExplanation
 * - Shows userConfusion callout if fallback content is in use
 */

import { useState } from 'react';
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock,
  FileText, Lightbulb, ExternalLink,
} from 'lucide-react';
import type { ElectionStep, KnowledgeLevel } from '@/types';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';

interface StepCardProps {
  step: ElectionStep;
  isActive: boolean;
  isCompleted: boolean;
  knowledgeLevel: KnowledgeLevel;
  userConfusion?: string;
  isFallbackContent?: boolean;
  onComplete: () => void;
  onSpeak: (text: string) => void;
  adaptationActive: boolean;
  isSpeaking: boolean;
  currentSpokenText: string | null;
  electionBodyUrl?: string;
  onInteraction?: () => void;
}

/** Full-depth election step card with TTS, expandable sections, and confusion callout */
export default function StepCard({
  step, isActive, isCompleted, knowledgeLevel,
  userConfusion: _userConfusion, isFallbackContent: _isFallbackContent,
  onComplete, onSpeak, adaptationActive, isSpeaking, currentSpokenText,
  electionBodyUrl, onInteraction,
}: StepCardProps) {
  void _userConfusion;
  void _isFallbackContent;
  const [showRequirements, setShowRequirements] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Always show detailedExplanation — it is the primary content for all levels.
  // simpleExplanation is only used when the adaptive system kicks in.
  const content = adaptationActive
    ? step.simpleExplanation
    : (step.detailedExplanation || step.description);

  const cardStyles = isCompleted
    ? 'border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
    : isActive
      ? 'border-blue-500/30 bg-blue-500/5 shadow-2xl shadow-blue-500/10'
      : 'border-white/5 bg-white/[0.01] opacity-60';

  const levelLabel = knowledgeLevel === 'advanced'
    ? 'Legal & Technical Detail'
    : knowledgeLevel === 'intermediate'
      ? 'Process & Procedure'
      : 'Core Concept';

  return (
    <div
      className={`relative border backdrop-blur-xl rounded-[2rem] p-8 transition-all duration-500 ${cardStyles} hover:border-white/10`}
      role="article"
      aria-label={`Step ${step.order}: ${step.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
            isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" data-testid="check-circle" /> : step.order}
          </span>
          <div>
            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
              <TranslatedText text={step.title} />
            </h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              <TranslatedText text={levelLabel} />
            </span>
          </div>
        </div>
        {step.timeline && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded-lg text-xs text-gray-400 whitespace-normal leading-tight max-w-[140px] md:max-w-none flex-shrink-0">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <TranslatedText text={step.timeline} />
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className={`text-sm leading-[1.8] ${isCompleted ? 'text-gray-400' : 'text-gray-200'} whitespace-pre-line`}>
          <TranslatedText text={content} as="p" />
        </div>

        {/* TTS Button */}
        <TTSButton
          text={content}
          isSpeaking={isSpeaking}
          currentText={currentSpokenText}
          onToggle={onSpeak}
        />
      </div>

      {/* Requirements — always expanded for active steps */}
      {step.requirements.length > 0 && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <button
            onClick={() => {
              setShowRequirements(!showRequirements);
              onInteraction?.();
            }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors w-full text-left"
            aria-expanded={showRequirements}
            aria-controls={`req-${step.id}`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-medium"><TranslatedText text="Requirements & Documents" /></span>
            <span className="ml-auto text-xs text-gray-600">({step.requirements.length})</span>
            {showRequirements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showRequirements && (
            <ul id={`req-${step.id}`} className="mt-3 space-y-2">
              {step.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <TranslatedText text={req} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tips */}
      {step.tips.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-4">
          <button
            onClick={() => {
              setShowTips(!showTips);
              onInteraction?.();
            }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors w-full text-left"
            aria-expanded={showTips}
            aria-controls={`tips-${step.id}`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="font-medium"><TranslatedText text="Expert Tips" /></span>
            <span className="ml-auto text-xs text-gray-600">({step.tips.length})</span>
            {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTips && (
            <ul id={`tips-${step.id}`} className="mt-3 space-y-2">
              {step.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-300/80">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <TranslatedText text={tip} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Official Source link — shown for intermediate/advanced */}
      {(knowledgeLevel === 'intermediate' || knowledgeLevel === 'advanced') && isActive && electionBodyUrl && (
        <a 
          href={electionBodyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-xs text-gray-500 hover:text-blue-400 transition-colors group"
        >
          <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
          <span className="underline underline-offset-2"><TranslatedText text="Verify with your country's official election commission for the most current information." /></span>
        </a>
      )}

      {/* Complete button */}
      {isActive && !isCompleted && (
        <button
          onClick={onComplete}
          className="mt-8 w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-2"
          aria-label={`Mark ${step.title} as complete`}
        >
          <TranslatedText text="Mark as Complete" /> ✓
        </button>
      )}
    </div>
  );
}
