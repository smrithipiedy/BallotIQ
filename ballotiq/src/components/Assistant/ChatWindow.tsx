'use client';

/**
 * Context-aware AI chat window.
 * Passes full user context to Gemini for personalized responses.
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { askAssistant } from '@/lib/gemini/client';
import { saveChatMessage } from '@/lib/firebase/firestore';
import { logAssistantQuestion } from '@/lib/firebase/analytics';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import { useSTT } from '@/hooks/useSTT';
import { getLanguageInfo } from '@/lib/constants/languages';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatWindowProps {
  userContext: UserContext;
  completedSteps: ElectionStep[];
  isSpeaking: boolean;
  currentSpokenText: string | null;
  onSpeak: (text: string) => void;
}

/** Full-featured chat interface with context-aware AI responses */
export default function ChatWindow({
  userContext, completedSteps, isSpeaking, currentSpokenText, onSpeak,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxChars = 300;
  
  const langInfo = getLanguageInfo(userContext.language);
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSTT(langInfo?.googleTTSCode ?? 'en-US');

  // Tracking if voice was used for the current interaction
  const [usedVoice, setUsedVoice] = useState(false);

  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
      setUsedVoice(true);
      sendMessage(transcript, true);
      setTranscript('');
    }
  }, [transcript, isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, fromVoice: boolean = false) => {
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

      const response = await askAssistant(sanitized, userContext, completedSteps, messages);

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await saveChatMessage(userContext.sessionId, assistantMsg);

      // Auto-speak if the user initiated with voice
      if (fromVoice || usedVoice) {
        onSpeak(response);
        setUsedVoice(false);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <ErrorBoundary componentName="ChatWindow">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-gray-500">
            <TranslatedText text="Personalized for" /> {userContext.countryName} • <TranslatedText text={userContext.knowledgeLevel} /> <TranslatedText text="level" />
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-6 animate-in fade-in duration-1000">
              {userContext.mainConfusion === 'Direct query' && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="max-w-[85%] px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-sm shadow-xl">
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
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed backdrop-blur-xl transition-all ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-xl shadow-blue-500/10'
                  : 'bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap"><TranslatedText text={msg.content} /></p>
                {msg.role === 'assistant' && (
                  <div className="mt-3">
                    <TTSButton text={msg.content} isSpeaking={isSpeaking} currentText={currentSpokenText} onToggle={onSpeak} />
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
            <div className="flex gap-3 justify-start">
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
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <p className="px-4 py-1 text-[10px] text-gray-600 text-center">
          <TranslatedText text="BallotIQ provides non-partisan educational information only. Not official election guidance." />
        </p>

        {/* Input */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask about elections..."}
                className={`w-full px-6 py-4 pr-16 bg-white/[0.03] border ${isListening ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10'} rounded-2xl text-[15px] text-white placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all`}
                rows={1}
                aria-label="Type your question"
                disabled={isLoading}
              />
              <span className="absolute right-4 bottom-2 text-[10px] font-medium tracking-tighter text-gray-600">{input.length}/{maxChars}</span>
            </div>
            
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`group px-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
              title={isListening ? "Stop Listening" : "Talk to AI"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                stopListening();
                sendMessage(input);
              }}
              disabled={!input.trim() || isLoading}
              className="group px-6 bg-white text-black rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
