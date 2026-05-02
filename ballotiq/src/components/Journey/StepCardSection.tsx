'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface StepCardSectionProps {
  id: string;
  title: string;
  items: string[];
  icon: LucideIcon;
  iconColor: string;
  itemBulletColor: string;
  itemTextColor: string;
  onInteraction?: () => void;
}

/**
 * Reusable expandable section for StepCard (Requirements, Tips, etc.)
 */
export default function StepCardSection({
  id, title, items, icon: Icon, iconColor,
  itemBulletColor, itemTextColor, onInteraction
}: StepCardSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="mt-3 border-t border-white/5 pt-4">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onInteraction?.();
        }}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors w-full text-left"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="font-medium"><TranslatedText text={title} /></span>
        <span className="ml-auto text-xs text-gray-600">({items.length})</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <ul id={id} className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className={`flex items-start gap-2 text-sm ${itemTextColor}`}>
              <span className={`w-1.5 h-1.5 ${itemBulletColor} rounded-full mt-2 flex-shrink-0`} />
              <TranslatedText text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
