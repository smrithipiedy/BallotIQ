/**
 * Quiz progress dots showing current position.
 * Visual indicator of quiz progression.
 */

interface ProgressDotsProps {
  total: number;
  current: number;
  results: Array<{ isCorrect: boolean }>;
}

/** Dot indicators for quiz progress with correct/incorrect coloring */
export default function ProgressDots({ total, current, results }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2 justify-center" role="navigation" aria-label="Quiz progress">
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i];
        let dotClass = 'bg-white/10';

        if (result) {
          dotClass = result.isCorrect ? 'bg-emerald-500' : 'bg-red-500';
        } else if (i === current) {
          dotClass = 'bg-blue-500 animate-pulse scale-125';
        }

        return (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${dotClass}`}
            aria-label={`Question ${i + 1}${result ? (result.isCorrect ? ' correct' : ' incorrect') : i === current ? ' current' : ''}`}
          />
        );
      })}
    </div>
  );
}
