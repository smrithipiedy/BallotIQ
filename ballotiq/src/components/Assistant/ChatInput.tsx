'use client';

import { Mic, MicOff, Send } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/constants';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isListening: boolean;
  isLoading: boolean;
  sttError: string | null;
  onSendMessage: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Chat input component with STT (Speech-to-Text) and character limit tracking.
 */
export default function ChatInput({
  input,
  setInput,
  isListening,
  isLoading,
  sttError,
  onSendMessage,
  onStartListening,
  onStopListening,
  onKeyDown,
}: ChatInputProps) {
  return (
    <div className="p-3 sm:p-4 border-t border-white/10 bg-[#020617]/70">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
            onKeyDown={onKeyDown}
            placeholder={isListening ? "Listening..." : "Ask about elections..."}
            className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-12 sm:pr-14 bg-white/[0.04] border ${isListening ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10'} rounded-xl sm:rounded-2xl text-sm sm:text-[15px] text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all`}
            rows={1}
            aria-label="Type your question"
            disabled={isLoading}
          />
          <span className="absolute right-3 bottom-1.5 text-[9px] sm:text-[10px] font-medium tracking-tighter text-gray-500">{input.length}/{MAX_CHAT_INPUT_LENGTH}</span>
        </div>
        
        <button
          onClick={() => {
            if (isListening) onStopListening();
            else onStartListening();
          }}
          disabled={isLoading}
          className={`group px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            isListening 
              ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
              : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
          }`}
          title={isListening ? "Stop voice input" : "Start voice input"}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          aria-pressed={isListening}
        >
          {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <button
          onClick={() => {
            onStopListening();
            onSendMessage(input);
          }}
          disabled={!input.trim() || isLoading}
          className="group px-4 sm:px-6 bg-white text-black rounded-xl sm:rounded-2xl hover:scale-[1.03] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="pt-2 min-h-5">
        {sttError ? (
          <p className="text-[11px] text-amber-400">
            <TranslatedText text="Voice input is currently unavailable. Please try again." />
          </p>
        ) : isListening ? (
          <p className="text-[11px] text-blue-300">
            <TranslatedText text="Listening... tap the mic again to stop." />
          </p>
        ) : null}
      </div>
    </div>
  );
}
