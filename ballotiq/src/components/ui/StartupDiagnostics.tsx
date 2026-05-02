'use client';

import { useEffect } from 'react';
import { testGeminiConnection } from '@/lib/gemini/client';

/** One-time diagnostic check for Gemini connection on application startup. */
export default function StartupDiagnostics() {
  useEffect(() => {
    testGeminiConnection();
  }, []);

  return null;
}
