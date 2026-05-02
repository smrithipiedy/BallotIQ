'use client';

import ScoreBoard from './ScoreBoard';
import type { QuizResult, KnowledgeLevel } from '@/types';

interface QuizCompleteProps {
  score: number;
  total: number;
  results: QuizResult[];
  knowledgeLevel: KnowledgeLevel;
  insight: string;
  countryName: string;
}

/**
 * Component rendered when the quiz is finished.
 * Displays the scoreboard and performance insights.
 */
export default function QuizComplete({
  score,
  total,
  results,
  knowledgeLevel,
  insight,
  countryName,
}: QuizCompleteProps) {
  return (
    <ScoreBoard
      score={score}
      total={total}
      results={results}
      knowledgeLevel={knowledgeLevel}
      performanceInsight={insight}
      countryName={countryName}
    />
  );
}
