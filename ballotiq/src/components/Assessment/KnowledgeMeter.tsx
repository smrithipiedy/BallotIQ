/**
 * Visual knowledge level badge component.
 * Shows a colored badge indicating the user's assessed level.
 */

import type { KnowledgeLevel } from '@/types';

interface KnowledgeMeterProps {
  level: KnowledgeLevel;
  className?: string;
  compact?: boolean;
}

/** Color-coded knowledge level badge */
const LEVEL_CONFIG: Record<KnowledgeLevel, { label: string; classes: string }> = {
  beginner: { label: 'Beginner', classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' },
  intermediate: { label: 'Intermediate', classes: 'bg-blue-500/15 text-blue-400 ring-blue-500/30' },
  advanced: { label: 'Advanced', classes: 'bg-purple-500/15 text-purple-400 ring-purple-500/30' },
};

/** Displays user's knowledge level as a styled badge */
export default function KnowledgeMeter({ level, className = '', compact = false }: KnowledgeMeterProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ${config.classes} ${
        compact ? 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest' : 'px-3 py-1 text-sm'
      } ${className}`}
      aria-label={`Knowledge level: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
