'use client';

/**
 * XSS-safe HTML renderer with built-in translation support.
 * Sanitizes AI-generated content before rendering and translates it
 * based on the global language choice.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeAIResponse } from '@/lib/security/sanitize';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/** Renders sanitized and translated HTML content safely */
export default function SafeHTML({ html, className = '' }: SafeHTMLProps) {
  const { translate, language } = useTranslation();
  const [processedHTML, setProcessedHTML] = useState(html);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function process() {
      if (language === 'en' || !html) {
        setProcessedHTML(sanitizeAIResponse(html));
        return;
      }

      setIsLoading(true);
      const translated = await translate(html);
      
      if (isMounted) {
        setProcessedHTML(sanitizeAIResponse(translated));
        setIsLoading(false);
      }
    }

    process();

    return () => {
      isMounted = false;
    };
  }, [html, language, translate]);

  return (
    <div
      className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}
      dangerouslySetInnerHTML={{ __html: processedHTML }}
      role="region"
      aria-label="AI generated content"
    />
  );
}
