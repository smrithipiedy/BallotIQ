'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
}

/**
 * Component that automatically translates its children text
 * when the global language changes.
 */
export default function TranslatedText({ 
  text, 
  className = '', 
  as: Component = 'span' 
}: TranslatedTextProps) {
  const { translate, language } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function performTranslation() {
      if (language === 'en' || !text) {
        setTranslatedText(text);
        return;
      }

      setIsLoading(true);
      const result = await translate(text);
      
      if (isMounted) {
        setTranslatedText(result);
        setIsLoading(false);
      }
    }

    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, language, translate]);

  return (
    <Component className={`${className} ${isLoading ? 'opacity-50 transition-opacity' : 'opacity-100'}`}>
      {translatedText}
    </Component>
  );
}
