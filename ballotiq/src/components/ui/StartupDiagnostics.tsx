'use client';

import { useEffect } from 'react';
import { testGeminiConnection } from '@/lib/gemini/client';

export default function StartupDiagnostics() {
  useEffect(() => {
    testGeminiConnection();
  }, []);

  return null;
}
