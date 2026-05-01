'use client';

/**
 * Renders the chat message history, welcome message, and loading indicator.
 * Extracted from ChatWindow for single-responsibility.
 */

import { forwardRef } from 'react';
import { Bot, User, ExternalLink } from 'lucide-react';
import type { ChatMessage, UserContext } from '@/types';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatHistoryProps {
  /** Array of chat messages to display */
  messages: ChatMessage[];
  /** Current user context for personalization */
  userContext: UserContext;
  /** Whether the AI is currently generating a response */
  isLoading: boolean;
  /** Whether to show suggested question chips */
  showSuggestions: boolean;
  /** Whether TTS is currently playing */
  isSpeaking: boolean;
  /** The text currently being spoken by TTS */
  currentSpokenText: string | null;
  /** Callback to toggle TTS playback for a given text */
  onSpeak: (text: string) => void;
  /** Callback when a suggested question chip is clicked */
  onSelectSuggestion: (question: string) => void;
}

/**
 * Displays the scrollable message list with assistant/user bubbles,
 * a welcome banner for direct-query users, and an animated typing indicator.
 */
const ChatHistory = forwardRef<HTMLDivElement, ChatHistoryProps>(function ChatHistory(
  { messages, userContext, isLoading, showSuggestions, isSpeaking, currentSpokenText, onSpeak, onSelectSuggestion },
  ref,
) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="space-y-6 animate-in fade-in duration-1000">
          {userContext.mainConfusion === 'Direct query' && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="max-w-[90%] sm:max-w-[85%] px-4 sm:px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-sm shadow-xl">
                <p>
                  <TranslatedText text={`Hello! I'm your BallotIQ assistant for ${userContext.countryName}.`} />
                  <br /><br />
                  <TranslatedText text="I'm here to help you understand the election process, key dates, and how to participate. You can type your question below or click the microphone to talk to me!" />
                </p>
              </div>
            </div>
          )}

          {showSuggestions && (
            <SuggestedQuestions
              countryName={userContext.countryName}
              onSelect={onSelectSuggestion}
            />
          )}
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
          {msg.role === 'assistant' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
          )}
          <div className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed backdrop-blur-xl transition-all ${
            msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-sm shadow-xl shadow-blue-500/10'
              : 'bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-sm'
          }`}>
            <p className="whitespace-pre-wrap"><TranslatedText text={msg.content} /></p>
            {msg.role === 'assistant' && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <TTSButton text={msg.content} isSpeaking={isSpeaking} currentText={currentSpokenText} onToggle={onSpeak} />
                <a
                  href={msg.officialSource?.url || userContext.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 px-2 py-1 rounded-md"
                >
                  <ExternalLink className="w-3 h-3" />
                  <TranslatedText text={msg.officialSource?.name || userContext.electionBody || "Official Source"} />
                </a>
              </div>
            )}
          </div>
          {msg.role === 'user' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start" aria-live="polite" aria-label="AI is typing">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={ref} />
    </div>
  );
});

export default ChatHistory;
