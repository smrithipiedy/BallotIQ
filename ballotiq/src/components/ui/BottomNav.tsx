import { useRouter } from 'next/navigation';
import { BookOpen, Trophy, MessageCircle, MapPin } from 'lucide-react';
import TranslatedText from '@/components/ui/TranslatedText';

export type ActiveTab = 'learn' | 'quiz' | 'polling' | 'assistant';

interface BottomNavProps {
  activeTab: ActiveTab;
  countryCode: string;
}

export default function BottomNav({ activeTab, countryCode }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020817] border-t border-white/[0.06] flex items-center px-2 sm:px-4 pb-safe"
      aria-label="Bottom navigation"
    >
      <button
        onClick={() => router.push(`/learn/${countryCode}`)}
        className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold gap-1 transition-colors ${
          activeTab === 'learn' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'
        }`}
        aria-label="Go to Learn page"
        aria-current={activeTab === 'learn' ? 'page' : undefined}
      >
        <BookOpen className="w-5 h-5" />
        <TranslatedText text="Learn" />
      </button>

      <button
        onClick={() => router.push('/quiz')}
        className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold gap-1 transition-colors ${
          activeTab === 'quiz' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'
        }`}
        aria-label="Go to Quiz page"
        aria-current={activeTab === 'quiz' ? 'page' : undefined}
      >
        <Trophy className="w-5 h-5" />
        <TranslatedText text="Quiz" />
      </button>

      <button
        onClick={() => router.push('/polling-stations')}
        className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold gap-1 transition-colors ${
          activeTab === 'polling' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'
        }`}
        aria-label="Go to Polling Stations page"
        aria-current={activeTab === 'polling' ? 'page' : undefined}
      >
        <MapPin className="w-5 h-5" />
        <TranslatedText text="Polls" />
      </button>

      <button
        onClick={() => router.push('/assistant')}
        className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold gap-1 transition-colors ${
          activeTab === 'assistant' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'
        }`}
        aria-label="Go to Assistant page"
        aria-current={activeTab === 'assistant' ? 'page' : undefined}
      >
        <MessageCircle className="w-5 h-5" />
        <TranslatedText text="Assistant" />
      </button>
    </nav>
  );
}
