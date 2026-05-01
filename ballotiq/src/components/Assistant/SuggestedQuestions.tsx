/**
 * Context-aware suggested question chips.
 * Shown before the user sends their first message.
 */

import TranslatedText from '@/components/ui/TranslatedText';

interface SuggestedQuestionsProps {
  countryName: string;
  onSelect: (question: string) => void;
}

/** Clickable question suggestions based on country */
export default function SuggestedQuestions({ countryName, onSelect }: SuggestedQuestionsProps) {
  const suggestions = [
    `How do elections work in ${countryName}?`,
    `What documents do I need to vote?`,
    `How is the vote counted?`,
    `What happens if I miss the registration deadline?`,
    `Can I vote if I live abroad?`,
    `What is the role of election observers?`,
  ];

  return (
    <div className="space-y-3" role="region" aria-label="Suggested questions">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
        <TranslatedText text="Try asking:" />
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(q);
              }
            }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={q}
          >
            <TranslatedText text={q} />
          </button>
        ))}
      </div>
    </div>
  );
}
