'use client';

/**
 * Text-to-Speech button component.
 * Toggles audio playback with visual feedback.
 */

import { Volume2, VolumeX } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  isSpeaking: boolean;
  currentText: string | null;
  onToggle: (text: string) => void;
  className?: string;
}

/** Audio playback toggle button with accessibility support */
export default function TTSButton({
  text, isSpeaking, currentText, onToggle, className = '',
}: TTSButtonProps) {
  const isActive = isSpeaking && currentText === text;

  return (
    <button
      onClick={() => onToggle(text)}
      data-tts-control="true"
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
      } ${className}`}
      aria-label={isActive ? 'Stop reading aloud' : 'Read aloud'}
      aria-pressed={isActive}
    >
      {isActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isActive ? 'Stop' : 'Listen'}</span>
    </button>
  );
}
