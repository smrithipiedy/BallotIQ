'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition } | undefined;
    webkitSpeechRecognition: { new (): SpeechRecognition } | undefined;
  }
}

/**
 * Hook for Speech-to-Text using Web Speech API.
 * Handles microphone input and converts it to text.
 */
export function useSTT(language: string = 'en-US', onResult?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      // Use setTimeout to avoid set-state-in-effect lint error
      const timer = setTimeout(() => {
        setError('Speech recognition not supported in this browser.');
      }, 0);
      return () => clearTimeout(timer);
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript;
      setTranscript(resultTranscript);
      if (event.results[current].isFinal) {
        onResult?.(resultTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language, onResult]);

  /**
   * Starts the Web Speech API recognition process.
   * Clears existing transcript and resets state.
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
   * Stops the Web Speech API recognition process.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop race conditions from browser API
      }
      setIsListening(false);
    }
  }, []);

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
