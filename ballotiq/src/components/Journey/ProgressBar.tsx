/**
 * Visual progress bar for learning journey.
 * Shows completion percentage with animated fill.
 */

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

/** Animated progress bar with percentage label */
export default function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`space-y-1.5 ${className}`} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress: ${current} of ${total} steps complete`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{current}/{total} steps</span>
        <span className="text-gray-400 font-medium">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
