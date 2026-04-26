/**
 * Visual knowledge level badge component.
 * Shows a colored badge indicating the user's assessed level.
 */

import type { KnowledgeLevel } from '@/types';

interface KnowledgeMeterProps {
  level: KnowledgeLevel;
  className?: string;
}

/** Color-coded knowledge level badge */
const LEVEL_CONFIG: Record<KnowledgeLevel, { emoji: string; label: string; classes: string }> = {
  beginner: { emoji: '🌱', label: 'Beginner', classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' },
  intermediate: { emoji: '📚', label: 'Intermediate', classes: 'bg-blue-500/15 text-blue-400 ring-blue-500/30' },
  advanced: { emoji: '🎓', label: 'Advanced', classes: 'bg-purple-500/15 text-purple-400 ring-purple-500/30' },
};

/** Displays user's knowledge level as a styled badge */
export default function KnowledgeMeter({ level, className = '' }: KnowledgeMeterProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ring-1 ${config.classes} ${className}`}
      aria-label={`Knowledge level: ${config.label}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  );
}
