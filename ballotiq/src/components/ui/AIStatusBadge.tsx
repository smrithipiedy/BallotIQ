/**
 * Visual indicator of the AI's current operational status.
 * Shows users whether they are getting Live AI, Cached, or Offline responses.
 */

import React from 'react';
import { Bot, Zap, CloudOff, Database } from 'lucide-react';
import TranslatedText from './TranslatedText';

export type AIStatusMode = 'live' | 'cached' | 'error';

interface AIStatusBadgeProps {
  mode: AIStatusMode;
  className?: string;
}

export default function AIStatusBadge({ mode, className = '' }: AIStatusBadgeProps) {
  const configs = {
    live: {
      label: 'Live AI',
      icon: Zap,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      pulse: true
    },
    cached: {
      label: 'Verified Cache',
      icon: Database,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      pulse: false
    },
    error: {
      label: 'AI Inactive',
      icon: Bot,
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
      pulse: false
    }
  };

  const config = configs[mode];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.color} ${className}`}>
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      <Icon className="w-3 h-3" />
      <span><TranslatedText text={config.label} /></span>
    </div>
  );
}
