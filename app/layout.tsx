import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import ThemeEnforcer from '@/components/ThemeEnforcer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gold Portfolio Tracker | Precision Wealth Management',
  description: 'Track your gold holdings (Antam, UBS, Galeri 24) with real-time P/L and historical price analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark', background: '#020617' }}>
      <body 
        className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen flex flex-col antialiased`}
        style={{ background: '#020617', color: '#f8fafc' }}
      >
        <ThemeEnforcer />
        <Providers>
          <PriceTicker />
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-slate-500 text-sm">
            Created by <a href="https://alvianzf.id" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30">alvianzf (alvianzf.id)</a>. &copy; {new Date().getFullYear()} Gold Tracker. Built for Precision.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
