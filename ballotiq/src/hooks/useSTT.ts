'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: null | (() => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  onerror: null | ((event: SpeechRecognitionErrorEventLike) => void);
  onend: null | (() => void);
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type SpeechRecognitionResultAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionResultAlternativeLike;
  isFinal?: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionWindowLike = {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/**
 * Hook for Speech-to-Text using Web Speech API.
 * Handles microphone input and converts it to text.
 */
export function useSTT(
  language: string = 'en-US',
  onFinalTranscript?: (finalText: string) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;

    const w = window as unknown as SpeechRecognitionWindowLike;
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    return SpeechRecognitionCtor ? null : 'Speech recognition not supported in this browser.';
  });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window === 'undefined') return;

    const w = window as unknown as SpeechRecognitionWindowLike;
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const resultTranscript = result?.[0]?.transcript ?? '';
      setTranscript(resultTranscript);

      // Only commit when the browser indicates this is a final transcription.
      if (resultTranscript && result?.isFinal && onFinalTranscript) {
        onFinalTranscript(resultTranscript);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      setError(event.error ?? 'Speech recognition error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language, onFinalTranscript]);

  /**
   * Begins capturing audio and processing it into a transcript.
   */
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition start error:', err);
      }
    }
  }, [isListening]);

  /**
   * Stops capturing audio and finishes processing the current transcript.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript
  };
}
