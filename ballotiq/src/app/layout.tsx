import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { TranslationProvider } from '@/context/TranslationContext';
import StartupDiagnostics from '@/components/ui/StartupDiagnostics';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BallotIQ — Personalized Election Education',
  description: 'Understand your vote. Shape your future. BallotIQ is an adaptive AI tutor that personalizes election education based on your knowledge level, country, and language.',
  keywords: ['election', 'voting', 'civic education', 'democracy', 'BallotIQ'],
  authors: [{ name: 'BallotIQ Team' }],
  openGraph: {
    title: 'BallotIQ — Personalized Election Education',
    description: 'AI-powered adaptive learning for election processes worldwide.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen bg-[#050510] text-gray-200 antialiased`}>
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 
                     focus:left-4 focus:z-[60] focus:px-4 focus:py-2 
                     focus:bg-blue-600 focus:text-white focus:rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <TranslationProvider>
          <StartupDiagnostics />
          <main id="main-content">
            <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><LoadingSkeleton lines={10} /></div>}>
              {children}
            </Suspense>
          </main>
          <div
            id="a11y-announcer"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
        </TranslationProvider>
      </body>
    </html>
  );
}
