'use client';

import { Bot, User, ExternalLink } from 'lucide-react';
import type { ChatMessage as ChatMessageType, UserContext } from '@/types';
import TTSButton from '@/components/ui/TTSButton';
import TranslatedText from '@/components/ui/TranslatedText';

interface ChatMessageProps {
  message: ChatMessageType;
  userContext: UserContext;
  isSpeaking: boolean;
  currentSpokenText: string | null;
  onSpeak: (text: string) => void;
}

/**
 * Individual chat message component with role-based styling and TTS support.
 */
export default function ChatMessage({
  message,
  userContext,
  isSpeaking,
  currentSpokenText,
  onSpeak,
}: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
      {isAssistant && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Bot className="w-4.5 h-4.5 text-blue-400" />
        </div>
      )}
      <div className={`max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed backdrop-blur-xl transition-all ${
        message.role === 'user'
          ? 'bg-blue-600 text-white rounded-tr-md shadow-lg shadow-blue-500/20'
          : 'bg-white/[0.03] border border-white/10 text-gray-100 rounded-tl-md'
      }`}>
        <p className="whitespace-pre-wrap"><TranslatedText text={message.content} /></p>
        {isAssistant && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <TTSButton text={message.content} isSpeaking={isSpeaking} currentText={currentSpokenText} onToggle={onSpeak} />
            <a 
              href={message.officialSource?.url || userContext.electionBodyUrl || `https://www.google.com/search?q=${encodeURIComponent(userContext.countryName + ' official election website')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-blue-300 hover:text-blue-200 transition-colors bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20"
            >
              <ExternalLink className="w-3 h-3" />
              <TranslatedText text={message.officialSource?.name || userContext.electionBody || "Official Source"} />
            </a>
          </div>
        )}
      </div>
      {message.role === 'user' && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <User className="w-4.5 h-4.5 text-indigo-300" />
        </div>
      )}
    </div>
  );
}
