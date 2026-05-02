'use client';

/**
 * Empty-state welcome message and suggested questions shown before the first chat message.
 */

import { Bot } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatEmptyStateProps {
  countryName: string;
  mainConfusion: string;
  showSuggestions: boolean;
  onSelect: (text: string) => void;
}

/** Renders the bot greeting and suggested questions when no messages exist yet */
export default function ChatEmptyState({
  countryName, mainConfusion, showSuggestions, onSelect,
}: ChatEmptyStateProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {mainConfusion === 'Direct query' && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed bg-white/[0.03] border border-white/10 text-gray-100 rounded-tl-md">
            <p>
              <TranslatedText text={`Hello! I'm your BallotIQ assistant for ${countryName}.`} />
              <br /><br />
              <TranslatedText text="I'm here to help you understand the election process, key dates, and how to participate. You can type your question below or click the microphone to talk to me!" />
            </p>
          </div>
        </div>
      )}

      {showSuggestions && (
        <SuggestedQuestions
          countryName={countryName}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
