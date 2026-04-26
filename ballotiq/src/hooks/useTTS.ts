'use client';

/**
 * Hook for text-to-speech playback with rate limiting.
 * Gracefully degrades when API is unavailable.
 */

import { useState, useCallback } from 'react';
import { synthesizeSpeech, playAudio, stopAudio, isPlaying as checkPlaying } from '@/lib/tts/client';
import { translateText } from '@/lib/translate/client';
import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';
import { getLanguageInfo } from '@/lib/constants/languages';
import type { SupportedLanguage } from '@/types';

interface UseTTSReturn {
  isSpeaking: boolean;
  currentText: string | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  toggle: (text: string) => Promise<void>;
}

/**
 * Manages TTS playback state and rate limiting.
 * @param language - Current language for voice selection
 * @param sessionId - Session ID for rate limiting
 * @returns TTS playback controls
 */
export function useTTS(language: SupportedLanguage, sessionId: string): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const speak = useCallback(async (text: string) => {
    const limit = await checkRateLimit(sessionId, 'tts');
    if (!limit.allowed) return;

    const langInfo = getLanguageInfo(language);
    const ttsCode = langInfo?.googleTTSCode ?? 'en-US';

    try {
      const audio = await synthesizeSpeech(text, ttsCode);
      if (audio) {
        playAudio(audio);
        setIsSpeaking(true);
        setCurrentText(text);
        await incrementUsage(sessionId, 'tts');

        // Reset state when audio ends
        setTimeout(() => {
          if (!checkPlaying()) {
            setIsSpeaking(false);
            setCurrentText(null);
          }
        }, Math.max(text.length * 80, 3000));
      }
    } catch {
      setIsSpeaking(false);
    }
  }, [language, sessionId]);

  const stop = useCallback(() => {
    stopAudio();
    setIsSpeaking(false);
    setCurrentText(null);
  }, []);

  const toggle = useCallback(async (text: string) => {
    if (isSpeaking && currentText === text) {
      stop();
    } else {
      await speak(text);
    }
  }, [isSpeaking, currentText, speak, stop]);

  return { isSpeaking, currentText, speak, stop, toggle };
}
