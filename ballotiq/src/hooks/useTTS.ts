'use client';

/**
 * Hook for text-to-speech playback with rate limiting.
 * Gracefully degrades when API is unavailable.
 */

import { useState, useCallback, useEffect } from 'react';
import { synthesizeSpeech, playAudio, stopAudio, isPlaying as checkPlaying } from '@/lib/tts/client';
import { translateText } from '@/lib/translate/client';
import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';
import { getLanguageInfo } from '@/lib/constants/languages';
import { useTranslation } from './useTranslation';

interface UseTTSReturn {
  isSpeaking: boolean;
  currentText: string | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  toggle: (text: string) => Promise<void>;
}

/**
 * Manages TTS playback state and rate limiting.
 * @param sessionId - Session ID for rate limiting
 * @returns TTS playback controls
 */
export function useTTS(sessionId: string): UseTTSReturn {
  const { language } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const stop = useCallback(() => {
    stopAudio();
    setIsSpeaking(false);
    setCurrentText(null);
  }, []);

  // Stop TTS whenever language changes or any other global action occurs
  useEffect(() => {
    const handleGlobalInteraction = (e: MouseEvent | TouchEvent) => {
      // Don't stop if we are clicking a button that is part of the TTS controls
      const target = e.target as HTMLElement;
      if (target.closest('[data-tts-control="true"]')) return;
      
      if (isSpeaking) {
        stop();
      }
    };

    window.addEventListener('mousedown', handleGlobalInteraction);
    window.addEventListener('touchstart', handleGlobalInteraction);
    
    return () => {
      window.removeEventListener('mousedown', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
    };
  }, [language, stop, isSpeaking]);

  const speak = useCallback(async (text: string) => {
    const limit = await checkRateLimit(sessionId, 'tts');
    if (!limit.allowed) return;

    const langInfo = getLanguageInfo(language);
    const ttsCode = langInfo?.googleTTSCode ?? 'en-US';

    try {
      setIsSpeaking(true);
      setCurrentText(text);

      // Translate text if language is NOT English
      let textToSpeak = text;
      if (language !== 'en') {
        const translated = await translateText(text, language);
        if (translated) textToSpeak = translated;
      }

      const audio = await synthesizeSpeech(textToSpeak, ttsCode);
      if (audio) {
        playAudio(audio);
        await incrementUsage(sessionId, 'tts');

        // Reset state when audio ends
        setTimeout(() => {
          if (!checkPlaying()) {
            setIsSpeaking(false);
            setCurrentText(null);
          }
        }, Math.max(textToSpeak.length * 80, 3000));
      } else {
        setIsSpeaking(false);
        setCurrentText(null);
      }
    } catch {
      setIsSpeaking(false);
      setCurrentText(null);
    }
  }, [language, sessionId]);



  const toggle = useCallback(async (text: string) => {
    if (isSpeaking && currentText === text) {
      stop();
    } else {
      await speak(text);
    }
  }, [isSpeaking, currentText, speak, stop]);

  return { isSpeaking, currentText, speak, stop, toggle };
}
