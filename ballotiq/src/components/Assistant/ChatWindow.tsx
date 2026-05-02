'use client';

/**
 * Context-aware AI chat window.
 * Passes full user context to Gemini for personalized responses.
 */

import { useState, useRef, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ChatMessage as ChatMessageType, ElectionStep, UserContext } from '@/types';
import { getAssistantResponse } from '@/lib/assistant/hybridAssistant';
import { saveChatMessage } from '@/lib/firebase/firestore';
import { logAssistantQuestion } from '@/lib/firebase/analytics';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import { useSTT } from '@/hooks/useSTT';
import { getLanguageInfo } from '@/lib/constants/languages';
import TranslatedText from '@/components/ui/TranslatedText';
import AIStatusBadge from '@/components/ui/AIStatusBadge';
import ChatMessage from './ChatMessage';
import ChatTypingIndicator from './ChatTypingIndicator';
import ChatInput from './ChatInput';
import ChatEmptyState from './ChatEmptyState';
import ChatStatusBar from './ChatStatusBar';

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
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessageType[]>([]);
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
    const userMsg: ChatMessageType = {
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

      const assistantMsg: ChatMessageType = {
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
      const errorMsg: ChatMessageType = {
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
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-transparent to-[#030712]/40"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.length === 0 && (
            <ChatEmptyState
              countryName={userContext.countryName}
              mainConfusion={userContext.mainConfusion}
              showSuggestions={showSuggestions}
              onSelect={sendMessage}
            />
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              userContext={userContext}
              isSpeaking={isSpeaking}
              currentSpokenText={currentSpokenText}
              onSpeak={onSpeak}
            />
          ))}

          {isLoading && <ChatTypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <ChatStatusBar />

        <ChatInput
          input={input}
          setInput={setInput}
          isListening={isListening}
          isLoading={isLoading}
          sttError={sttError}
          onSendMessage={sendMessage}
          onStartListening={startListening}
          onStopListening={stopListening}
          onKeyDown={handleKeyDown}
        />
      </div>
    </ErrorBoundary>
  );
}
