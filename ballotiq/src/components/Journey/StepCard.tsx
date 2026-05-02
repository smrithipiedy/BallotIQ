'use client';

/**
 * Election step card with depth-appropriate content display.
 * - Beginner: detailedExplanation (plain language)
 * - Intermediate/Advanced: detailedExplanation (full depth)
 * - Adaptation mode: expanded simplified explanation
 * - Shows userConfusion callout if fallback content is in use
 */

import {
  CheckCircle2, Clock, FileText, Lightbulb, ExternalLink,
} from 'lucide-react';
import type { ElectionStep, KnowledgeLevel } from '@/types';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';
import { simplifyText } from '@/lib/utils/textUtils';
import StepCardSection from './StepCardSection';

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

  // Adaptive mode should remain detailed but easier to understand.
  const content = adaptationActive
    ? buildAdaptiveContent(step)
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
          <span className="flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded-lg text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
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

      <StepCardSection
        id={`req-${step.id}`}
        title="Requirements & Documents"
        items={step.requirements}
        icon={FileText}
        iconColor="text-blue-400"
        itemBulletColor="bg-blue-400"
        itemTextColor="text-gray-300"
        onInteraction={onInteraction}
      />

      <StepCardSection
        id={`tips-${step.id}`}
        title="Expert Tips"
        items={step.tips}
        icon={Lightbulb}
        iconColor="text-amber-400"
        itemBulletColor="bg-amber-400"
        itemTextColor="text-amber-300/80"
        onInteraction={onInteraction}
      />

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

function buildAdaptiveContent(step: ElectionStep): string {
  const simple = (step.simpleExplanation || '').trim();
  const detailed = (step.detailedExplanation || step.description || '').trim();

  const sentenceCount = simple
    ? simple.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).length
    : 0;

  const hasRichSimple = simple.length >= 180 && sentenceCount >= 3;

  let intro = hasRichSimple
    ? simple
    : simplifyText(detailed || simple || step.description);

  // Keep adaptive content substantive, never a one-liner.
  if (intro.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).length < 3) {
    intro = `${intro}\n\nThis step is important because it helps you avoid mistakes and vote correctly on election day.`;
  }

  const reqPoints = step.requirements.slice(0, 3).map((req) => `- ${req}`);
  const tipPoints = step.tips.slice(0, 2).map((tip) => `- ${tip}`);

  const sections: string[] = [intro];

  if (reqPoints.length > 0) {
    sections.push(`What you need:\n${reqPoints.join('\n')}`);
  }

  if (tipPoints.length > 0) {
    sections.push(`Easy tips:\n${tipPoints.join('\n')}`);
  }

  return sections.join('\n\n');
}
