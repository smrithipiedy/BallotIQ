'use client';

import { useRef, useState, useEffect } from 'react';
import { LayoutGrid, Brain, Globe, Languages, Accessibility, LucideIcon } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  { icon: LayoutGrid, title: 'Dual Modes', desc: 'Structured lessons or direct AI conversation', color: 'bg-indigo-500' },
  { icon: Brain, title: 'Adaptive AI', desc: 'Content that grows with your knowledge level', color: 'bg-purple-500' },
  { icon: Globe, title: 'Regional Specific', desc: "Deep guides for your country's unique rules", color: 'bg-blue-500' },
  { icon: Languages, title: 'Multi-Language', desc: 'Native translations for 8 global languages', color: 'bg-emerald-500' },
  { icon: Accessibility, title: 'Inclusive', desc: 'Screen reader and keyboard accessibility', color: 'bg-amber-500' },
];

/**
 * Infinite horizontal carousel of feature cards.
 */
export default function FeatureGrid() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let exactScroll = carouselRef.current ? carouselRef.current.scrollLeft : 0;

    const scroll = (time: number) => {
      if (carouselRef.current) {
        if (!isPaused) {
          const deltaTime = time - lastTime;
          const speed = window.innerWidth < 640 ? 0.052 : 0.04;
          
          exactScroll += speed * deltaTime;
          
          if (exactScroll >= carouselRef.current.scrollWidth / 2) {
            exactScroll -= carouselRef.current.scrollWidth / 2;
          }
          
          carouselRef.current.scrollLeft = exactScroll;
        } else {
          exactScroll = carouselRef.current.scrollLeft;
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="relative z-10 py-16 overflow-hidden bg-white/[0.01] border-y border-white/5">
      <div 
        ref={carouselRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex whitespace-nowrap overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing"
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-4 px-2 flex-shrink-0">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="inline-flex flex-col w-[220px] sm:w-[280px] aspect-square sm:aspect-auto justify-center sm:justify-start p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 mx-2 flex-shrink-0">
                <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-lg shadow-black/20`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2"><TranslatedText text={title} /></h3>
                <p className="text-gray-500 leading-relaxed text-xs whitespace-normal"><TranslatedText text={desc} /></p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
