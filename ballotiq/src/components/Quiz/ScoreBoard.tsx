/**
 * Quiz results scoreboard with shareable completion badge.
 * Shows score, performance message, and celebratory animation.
 */

import type { QuizResult } from '@/types';
import KnowledgeMeter from '@/components/Assessment/KnowledgeMeter';
import type { KnowledgeLevel } from '@/types';

interface ScoreBoardProps {
  score: number;
  total: number;
  results: QuizResult[];
  knowledgeLevel: KnowledgeLevel;
  performanceInsight: string;
  countryName: string;
  onRetake?: () => void;
}

/** Results display with badge, score, and performance insight */
export default function ScoreBoard({
  score, total, results, knowledgeLevel,
  performanceInsight, countryName, onRetake,
}: ScoreBoardProps) {
  const percentage = Math.round((score / total) * 100);
  const isPassing = percentage >= 60;
  const isPerfect = percentage === 100;

  const avgTime = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.timeTakenSeconds, 0) / results.length)
    : 0;

  return (
    <div className="text-center space-y-8 py-6">
      {/* Celebration emoji */}
      <div className="text-6xl animate-bounce" aria-hidden="true">
        {isPerfect ? '🏆' : isPassing ? '🎉' : '📖'}
      </div>

      {/* Score circle */}
      <div className="relative mx-auto w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
            className={isPerfect ? 'text-amber-400' : isPassing ? 'text-emerald-400' : 'text-blue-400'}
            strokeDasharray={`${(percentage / 100) * 339.3} 339.3`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${isPerfect ? 'text-amber-400' : isPassing ? 'text-emerald-400' : 'text-blue-400'}`}>
            {score}/{total}
          </span>
          <span className="text-xs text-gray-500">{percentage}%</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isPerfect ? 'Perfect Score!' : isPassing ? 'Quiz Complete!' : 'Keep Learning!'}
        </h2>
        <p className="text-gray-400">
          {countryName} Election Knowledge Assessment
        </p>
        <div className="mt-3 flex justify-center">
          <KnowledgeMeter level={knowledgeLevel} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{avgTime}s</p>
          <p className="text-xs text-gray-500">Avg. time per question</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{score}</p>
          <p className="text-xs text-gray-500">Correct answers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{total - score}</p>
          <p className="text-xs text-gray-500">Incorrect</p>
        </div>
      </div>

      {/* Performance insight from Gemini */}
      {performanceInsight && (
        <div className="max-w-lg mx-auto p-8 bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl">
          <p className="text-[15px] text-gray-300 leading-relaxed italic">
            &ldquo;{performanceInsight}&rdquo;
          </p>
        </div>
      )}

      {/* Shareable badge */}
      {isPassing && (
        <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-b from-emerald-500/20 to-transparent">
          <div className="p-8 bg-[#081508] border border-emerald-500/10 rounded-[2.25rem] shadow-2xl">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mb-2">Certificate of Completion</p>
            <p className="text-2xl font-black text-white mb-1">🗳️ BallotIQ Certified</p>
            <p className="text-sm text-emerald-400/60 font-medium">{countryName} Election Process • {percentage}%</p>
          </div>
        </div>
      )}

      {onRetake && (
        <div className="pt-4">
          <button
            onClick={onRetake}
            className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300 active:scale-95 shadow-xl"
            aria-label="Retake the quiz"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
