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
  const [language, setLang] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize from storage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('ballotiq_lang') as SupportedLanguage;
    if (saved && ['en', 'hi', 'te', 'ta', 'fr', 'es', 'de', 'pt'].includes(saved)) {
      setLang(saved);
    }
  }, []);

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
      return await translateText(text, language);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateMany = useCallback(async (texts: string[]): Promise<string[]> => {
    if (language === 'en' || texts.length === 0) return texts;
    setIsTranslating(true);
    try {
      return await translateBatch(texts, language);
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
