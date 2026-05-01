'use client';

/**
 * Context-aware AI chat window.
 * Passes full user context to Gemini for personalized responses.
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { getAssistantResponse } from '@/lib/assistant/hybridAssistant';
import { saveChatMessage } from '@/lib/firebase/firestore';
import { logAssistantQuestion } from '@/lib/firebase/analytics';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import { useSTT } from '@/hooks/useSTT';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/constants';
import { getLanguageInfo } from '@/lib/constants/languages';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';
import SuggestedQuestions from './SuggestedQuestions';
import AIStatusBadge from '@/components/ui/AIStatusBadge';
import { ExternalLink } from 'lucide-react';

interface ChatWindowProps {
  userContext: UserContext;
  completedSteps: ElectionStep[];
  isSpeaking: boolean;
  currentSpokenText: string | null;
  onSpeak: (text: string) => void;
  onAiStatusChange?: (active: boolean) => void;
}

/** Full-featured chat interface with context-aware AI responses */
export default function ChatWindow({
  userContext, completedSteps, isSpeaking, currentSpokenText, onSpeak, onAiStatusChange,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  
  const langInfo = getLanguageInfo(userContext.language);
  const { isListening, error: sttError, startListening, stopListening } = useSTT(
    langInfo?.googleTTSCode ?? 'en-US',
    (finalText) => {
      // Final STT transcript arrives asynchronously; send it as a chat message.
      void sendMessage(finalText, true);
    },
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string, fromVoice: boolean = false) {
    const sanitized = sanitizeUserInput(text);
    if (!sanitized.trim() || isLoading) return;

    setShowSuggestions(false);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: sanitized,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      await saveChatMessage(userContext.sessionId, userMsg);
      await logAssistantQuestion(userContext.countryCode, userContext.knowledgeLevel);

      const result = await getAssistantResponse(
        sanitized,
        userContext,
        completedSteps,
        [...messagesRef.current, userMsg],
      );
      const response = result.content;

      // Detect AI failure responses
      onAiStatusChange?.(result.source !== 'error');

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        officialSource: result.officialSource,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await saveChatMessage(userContext.sessionId, assistantMsg);

      // Auto-speak if the user initiated with voice
      if (fromVoice) {
        onSpeak(response);
      }
    } catch {
      onAiStatusChange?.(false);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <ErrorBoundary componentName="ChatWindow">
      <div className="flex flex-col min-h-0 h-full rounded-[1.75rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 truncate">
            <TranslatedText text="Personalized for" /> {userContext.countryName} • <TranslatedText text={userContext.knowledgeLevel} /> <TranslatedText text="level" />
          </p>
          <AIStatusBadge mode={isLoading ? 'live' : 'cached'} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-transparent to-[#030712]/40">
          {messages.length === 0 && (
            <div className="space-y-6 animate-in fade-in duration-1000">
              {userContext.mainConfusion === 'Direct query' && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed bg-white/[0.03] border border-white/10 text-gray-100 rounded-tl-md">
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
                  onSelect={sendMessage}
                />
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-blue-400" />
                </div>
              )}
              <div className={`max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed backdrop-blur-xl transition-all ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-md shadow-lg shadow-blue-500/20'
                  : 'bg-white/[0.03] border border-white/10 text-gray-100 rounded-tl-md'
              }`}>
                <p className="whitespace-pre-wrap"><TranslatedText text={msg.content} /></p>
                {msg.role === 'assistant' && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <TTSButton text={msg.content} isSpeaking={isSpeaking} currentText={currentSpokenText} onToggle={onSpeak} />
                    <a 
                      href={msg.officialSource?.url || userContext.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] text-blue-300 hover:text-blue-200 transition-colors bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <TranslatedText text={msg.officialSource?.name || userContext.electionBody || "Official Source"} />
                    </a>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-indigo-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <p className="px-4 py-1.5 text-[10px] text-gray-500 text-center">
          <TranslatedText text="BallotIQ provides non-partisan educational information only. Not official election guidance." />
        </p>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#020617]/70">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
                onKeyDown={handleKeyDown}
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
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
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
                stopListening();
                sendMessage(input);
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
      </div>
    </ErrorBoundary>
  );
}
