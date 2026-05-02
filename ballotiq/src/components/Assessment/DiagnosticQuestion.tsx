'use client';

/**
 * Single diagnostic assessment question component.
 * Renders different UI for each of the 3 question types.
 */

import { useCallback, useMemo, useState } from 'react';
import VoiceInputButton from './VoiceInputButton';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import TranslatedText from '@/components/ui/TranslatedText';
import TTSButton from '@/components/ui/TTSButton';
import { useSTT } from '@/hooks/useSTT';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageInfo } from '@/lib/constants/languages';

interface DiagnosticQuestionProps {
  questionNumber: 1 | 2 | 3;
  onAnswer: (answer: boolean | number | string) => void;
  isLoading: boolean;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  currentText?: string | null;
}

/** Renders the appropriate question UI based on question number */
export default function DiagnosticQuestion({
  questionNumber, onAnswer, isLoading, onSpeak, isSpeaking = false, currentText = null,
}: DiagnosticQuestionProps) {
  const [textInput, setTextInput] = useState('');
  const [selectedScale, setSelectedScale] = useState<number | null>(null);
  const { language } = useTranslation();
  const maxChars = 200;

  const sttLanguage = useMemo(
    () => getLanguageInfo(language)?.googleTTSCode ?? 'en-US',
    [language]
  );

  const appendTranscript = useCallback((spokenText: string) => {
    const cleanSpoken = spokenText.trim();
    if (!cleanSpoken) return;
    setTextInput((prev) => {
      const prefix = prev.trim().length > 0 ? `${prev.trim()} ` : '';
      return `${prefix}${cleanSpoken}`.slice(0, maxChars);
    });
  }, []);

  const { isListening, error, startListening, stopListening } = useSTT(sttLanguage, appendTranscript);

  if (questionNumber === 1) {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white" id="q1-heading">
          <TranslatedText text="Have you voted in an election before?" />
        </h2>
        {onSpeak && (
          <TTSButton
            text="Have you voted in an election before?"
            isSpeaking={isSpeaking}
            currentText={currentText}
            onToggle={onSpeak}
          />
        )}
        <p className="text-sm sm:text-base text-gray-400"><TranslatedText text="This helps us understand your starting point." /></p>
        <div className="flex flex-col gap-3 sm:gap-4" role="group" aria-labelledby="q1-heading">
          {[
            { label: 'Yes, I have', value: true, icon: '✅' },
            { label: 'No, first time', value: false, icon: '🆕' },
            { label: "I'm not sure yet", value: false, icon: '🤔' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => onAnswer(opt.value)}
              disabled={isLoading}
              className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-white/[0.03] border border-white/5 rounded-2xl sm:rounded-[2rem] text-left text-white backdrop-blur-xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              aria-label={opt.label}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-xl sm:text-2xl">{opt.icon}</span>
              </div>
              <span className="text-lg sm:text-xl font-medium"><TranslatedText text={opt.label} /></span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (questionNumber === 2) {
    const labels = ['Complete beginner', 'Mostly new', 'Somewhat familiar', 'Fairly confident', 'Very knowledgeable'];
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white" id="q2-heading">
          <TranslatedText text="How well do you understand your country's election process?" />
        </h2>
        {onSpeak && (
          <TTSButton
            text="How well do you understand your country's election process?"
            isSpeaking={isSpeaking}
            currentText={currentText}
            onToggle={onSpeak}
          />
        )}
        <p className="text-sm sm:text-base text-gray-400"><TranslatedText text="Rate your current knowledge level." /></p>
        <div className="flex flex-col gap-3 sm:gap-4" role="group" aria-labelledby="q2-heading">
          {labels.map((label, i) => {
            const value = i + 1;
            const isSelected = selectedScale === value;
            return (
              <button
                key={value}
                onClick={() => { setSelectedScale(value); onAnswer(value); }}
                disabled={isLoading}
                className={`flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-4 sm:py-5 border rounded-2xl sm:rounded-[2rem] text-left transition-all duration-300 disabled:opacity-50 backdrop-blur-xl ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-white/[0.03] border-white/5 text-white hover:bg-white/10 hover:border-blue-500/30'
                }`}
                aria-label={`${value} out of 5: ${label}`}
                aria-pressed={isSelected}
              >
                <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold transition-colors flex-shrink-0 ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {value}
                </span>
                <span className="text-lg sm:text-xl font-medium"><TranslatedText text={label} /></span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  const charCount = textInput.length;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white" id="q3-heading">
        <TranslatedText text="What confuses you most about elections?" />
      </h2>
      {onSpeak && (
        <TTSButton
          text="What confuses you most about elections?"
          isSpeaking={isSpeaking}
          currentText={currentText}
          onToggle={onSpeak}
        />
      )}
      <p className="text-sm sm:text-base text-gray-400"><TranslatedText text="Tell us what you would like to understand better." /></p>
      <div className="space-y-4">
        <div className="relative p-0.5 rounded-2xl sm:rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value.slice(0, maxChars))}
            placeholder="e.g. How does vote counting work? What is a constituency?"
            className="w-full h-32 sm:h-40 px-4 sm:px-6 py-4 sm:py-6 pr-14 sm:pr-16 bg-[#080815] rounded-[1.4rem] sm:rounded-[1.9rem] text-white placeholder-gray-600 resize-none focus:outline-none transition-all text-base sm:text-lg leading-relaxed"
            aria-labelledby="q3-heading"
            aria-describedby="char-counter"
            maxLength={maxChars}
            disabled={isLoading}
          />
          <VoiceInputButton
            isListening={isListening}
            isLoading={isLoading}
            onToggle={isListening ? stopListening : startListening}
          />
        </div>
        <div className="px-2 min-h-5">
          {error && (
            <p className="text-[10px] sm:text-xs text-amber-400">
              <TranslatedText text="Voice input is unavailable on this browser. You can continue typing." />
            </p>
          )}
          {isListening && !error && (
            <p className="text-[10px] sm:text-xs text-blue-300 animate-pulse">
              <TranslatedText text="Listening... speak now." />
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <span id="char-counter" className={`text-[10px] sm:text-xs font-medium tracking-widest uppercase ${charCount > 180 ? 'text-amber-400' : 'text-gray-600'}`}>
            {charCount}/{maxChars} <TranslatedText text="characters" />
          </span>
          <button
            onClick={() => onAnswer(sanitizeUserInput(textInput || 'General election process'))}
            disabled={isLoading}
            className="w-full sm:w-auto group px-8 py-3 sm:py-4 bg-white text-black font-bold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95 flex items-center justify-center gap-2"
            aria-label="Submit your answer"
          >
            {isLoading ? <TranslatedText text="Analyzing..." /> : <><TranslatedText text="Continue" /> <span className="group-hover:translate-x-1 transition-transform">→</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
