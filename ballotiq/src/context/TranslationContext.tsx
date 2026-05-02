'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SupportedLanguage } from '@/types';
import { clearTranslationCache, translateText, translateBatch } from '@/lib/translate/client';

interface TranslationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (text: string) => Promise<string>;
  translateMany: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<SupportedLanguage>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('ballotiq_lang') as SupportedLanguage;
    return (saved && ['en', 'hi', 'te', 'ta', 'fr', 'es', 'de', 'pt'].includes(saved)) ? saved : 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    localStorage.setItem('ballotiq_lang', lang);
    clearTranslationCache();
    setLang(lang);
    console.info(`[Translation] Language changed to: ${lang}. Cache cleared.`);
  }, []);

  const translate = useCallback(async (text: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    setIsTranslating(true);
    try {
      let sessionId: string | undefined;
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('ballotiq_context');
        if (stored) sessionId = JSON.parse(stored).sessionId;
      }
      return await translateText(text, language, sessionId);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateMany = useCallback(async (texts: string[]): Promise<string[]> => {
    if (language === 'en' || texts.length === 0) return texts;
    setIsTranslating(true);
    try {
      let sessionId: string | undefined;
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('ballotiq_context');
        if (stored) sessionId = JSON.parse(stored).sessionId;
      }
      return await translateBatch(texts, language, sessionId);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate, translateMany, isTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
