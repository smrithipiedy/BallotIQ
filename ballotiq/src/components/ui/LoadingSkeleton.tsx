/**
 * Reusable loading skeleton with pulse animation.
 * Used while content loads from Gemini or Firestore.
 */

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

/** Animated skeleton placeholder for loading states */
export default function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-white/10 rounded-lg ${
            i === lines - 1 ? 'w-2/3' : i % 2 === 0 ? 'w-full' : 'w-5/6'
          }`}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
