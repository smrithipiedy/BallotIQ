'use client';

/**
 * Context-aware AI chat window.
 * Orchestrates ChatHistory, ChatInput, and SuggestedQuestions.
 * All rendering is delegated to sub-components.
 */

import { useState, useRef, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ChatMessage, ElectionStep, UserContext } from '@/types';
import { getAssistantResponse } from '@/lib/assistant/hybridAssistant';
import { saveChatMessage } from '@/lib/firebase/firestore';
import { logAssistantQuestion } from '@/lib/firebase/analytics';
import { sanitizeUserInput } from '@/lib/security/sanitize';
import { useSTT } from '@/hooks/useSTT';
import { getLanguageInfo } from '@/lib/constants/languages';
import AIStatusBadge from '@/components/ui/AIStatusBadge';
import TranslatedText from '@/components/ui/TranslatedText';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

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
  const { isListening, startListening, stopListening } = useSTT(
    langInfo?.googleTTSCode ?? 'en-US',
    (finalText) => { void sendMessage(finalText, true); },
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Sends a message and streams an AI response */
  async function sendMessage(text: string, fromVoice: boolean = false) {
    const sanitized = sanitizeUserInput(text);
    if (!sanitized.trim() || isLoading) return;

    setShowSuggestions(false);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`, role: 'user',
      content: sanitized, timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      await saveChatMessage(userContext.sessionId, userMsg);
      await logAssistantQuestion(userContext.countryCode, userContext.knowledgeLevel);
      const result = await getAssistantResponse(sanitized, userContext, completedSteps, [...messagesRef.current, userMsg]);
      onAiStatusChange?.(result.source !== 'error');

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`, role: 'assistant',
        content: result.content, timestamp: new Date().toISOString(),
        officialSource: result.officialSource,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await saveChatMessage(userContext.sessionId, assistantMsg);
      if (fromVoice) onSpeak(result.content);
    } catch {
      onAiStatusChange?.(false);
      setMessages((prev) => [...prev, {
        id: `msg_${Date.now()}_error`, role: 'assistant',
        content: 'Something went wrong. Please try again.', timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ErrorBoundary componentName="ChatWindow">
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <TranslatedText text="Personalized for" /> {userContext.countryName} • <TranslatedText text={userContext.knowledgeLevel} /> <TranslatedText text="level" />
          </p>
          <AIStatusBadge mode={isLoading ? 'live' : 'cached'} />
        </div>

        <ChatHistory
          ref={messagesEndRef}
          messages={messages}
          userContext={userContext}
          isLoading={isLoading}
          showSuggestions={showSuggestions}
          isSpeaking={isSpeaking}
          currentSpokenText={currentSpokenText}
          onSpeak={onSpeak}
          onSelectSuggestion={sendMessage}
        />

        <p className="px-4 py-1 text-[10px] text-gray-600 text-center">
          <TranslatedText text="BallotIQ provides non-partisan educational information only. Not official election guidance." />
        </p>

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSend={() => { stopListening(); sendMessage(input); }}
          isLoading={isLoading}
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
        />
      </div>
    </ErrorBoundary>
  );
}
