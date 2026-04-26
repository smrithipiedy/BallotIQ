/**
 * AI status indicator component.
 * Shows the user whether they are currently being assisted by Live AI
 * or the Offline Library (FAQ/Fallback).
 */

import React from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';
import TranslatedText from './TranslatedText';

interface AIStatusBadgeProps {
  mode: 'live' | 'offline' | 'hybrid';
  isGeminiEnabled?: boolean;
}

/** 
 * Visual badge for AI connectivity status.
 * Matches audit requirement for transparency.
 */
const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({ mode, isGeminiEnabled = true }) => {
  const isOffline = mode === 'offline' || !isGeminiEnabled;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
      isOffline 
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    }`}>
      {isOffline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            <TranslatedText text="Offline Library" />
          </span>
        </>
      ) : (
        <>
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            <TranslatedText text="Live AI Active" />
          </span>
        </>
      )}
    </div>
  );
};

export default AIStatusBadge;
