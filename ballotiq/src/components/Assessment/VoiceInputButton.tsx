'use client';

/**
 * Voice input button for the diagnostic question textarea.
 * Toggles STT listening and shows mic/mic-off icon.
 */

import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

/** Mic toggle button rendered inside the question-3 textarea */
export default function VoiceInputButton({ isListening, isLoading, onToggle }: VoiceInputButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isLoading}
      className={`absolute right-3 sm:right-4 bottom-3 sm:bottom-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500/20 border-red-400/60 text-red-300'
          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      aria-pressed={isListening}
    >
      {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
    </button>
  );
}
