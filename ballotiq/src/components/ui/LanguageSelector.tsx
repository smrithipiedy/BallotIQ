'use client';

/**
 * Language selector dropdown for 8 supported languages.
 * Integrated with TranslationContext for global state management.
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '@/lib/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportedLanguage } from '@/types';

interface LanguageSelectorProps {
  className?: string;
}

/** Premium custom dropdown for switching between 8 supported languages */
export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-blue-400" />
        <span className="font-medium">{currentLang.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-48 bg-[#070718] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          role="listbox"
        >
          <div className="px-3 py-1.5 mb-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Language</p>
          </div>
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  language === lang.code
                    ? 'bg-blue-500/10 text-blue-400 font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                role="option"
                aria-selected={language === lang.code}
              >
                <div className="flex flex-col items-start">
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] opacity-50">{lang.name}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
