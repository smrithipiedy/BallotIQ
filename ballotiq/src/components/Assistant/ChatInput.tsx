'use client';

/**
 * Chat input area with textarea, character counter, mic button, and send button.
 * Extracted from ChatWindow for single-responsibility.
 */

import { Send, Mic, MicOff } from 'lucide-react';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/constants/ai';

interface ChatInputProps {
  /** Current text value of the input */
  input: string;
  /** Callback when input text changes */
  onInputChange: (value: string) => void;
  /** Callback to send the current message */
  onSend: () => void;
  /** Whether the AI is currently generating a response */
  isLoading: boolean;
  /** Whether speech-to-text is actively listening */
  isListening: boolean;
  /** Callback to start speech-to-text */
  onStartListening: () => void;
  /** Callback to stop speech-to-text */
  onStopListening: () => void;
}

/**
 * Renders the chat input bar with a resizable textarea, character counter,
 * microphone toggle, and send button. Handles Enter-to-send.
 */
export default function ChatInput({
  input, onInputChange, onSend, isLoading, isListening, onStartListening, onStopListening,
}: ChatInputProps) {
  /** Sends on Enter (without Shift) */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="shrink-0 p-3 sm:p-6 border-t border-white/5 bg-white/[0.01]">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative group">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask about elections..."}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 bg-white/[0.03] border ${isListening ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10'} rounded-xl sm:rounded-2xl text-sm sm:text-[15px] text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all`}
            rows={1}
            aria-label="Type your question"
            disabled={isLoading}
          />
          <span className="absolute right-3 bottom-1.5 text-[9px] sm:text-[10px] font-medium tracking-tighter text-gray-600">
            {input.length}/{MAX_CHAT_INPUT_LENGTH}
          </span>
        </div>

        <button
          onClick={isListening ? onStopListening : onStartListening}
          disabled={isLoading}
          className={`group px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
            isListening
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
          title={isListening ? "Stop Listening" : "Talk to AI"}
        >
          {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <button
          onClick={() => {
            onStopListening();
            onSend();
          }}
          disabled={!input.trim() || isLoading}
          className="group px-4 sm:px-6 bg-white text-black rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
