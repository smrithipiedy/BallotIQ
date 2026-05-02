'use client';

import { Bot } from 'lucide-react';

/**
 * Animated typing indicator for the assistant.
 */
export default function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-400" />
      </div>
      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl rounded-bl-md"
        aria-live="polite"
        aria-label="AI is typing"
        role="status"
      >
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
