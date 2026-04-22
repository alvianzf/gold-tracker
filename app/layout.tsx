import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import ThemeEnforcer from '@/components/ThemeEnforcer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://tabungan-tracker.vercel.app'), // Replace with your actual production domain
  title: {
    template: '%s | Gold Tracker Terminal',
    default: 'Gold Tracker | Precision Portfolio Management',
  },
  description: 'Track your gold holdings (Antam, UBS, Galeri 24) with real-time P/L and historical price analytics. Execute trades securely with advanced dashboard insights.',
  keywords: ['Gold Tracker', 'Tabungan', 'Finance Tracker', 'Antam', 'UBS Gold', 'Portfolio Management', 'Investment', 'Real-time Analytics'],
  openGraph: {
    title: 'Gold Tracker | Precision Portfolio Management',
    description: 'Track your gold holdings and financial transactions with real-time analytics and an elite dark UI system.',
    url: 'https://tabungan-tracker.vercel.app',
    siteName: 'Gold Tracker Terminal',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/logo.png', // Ideally you would add an og-image.png here
        width: 1200,
        height: 630,
        alt: 'Gold Tracker Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gold Tracker | Vault & Finance Analytics',
    description: 'Elite tracking for your precious metals and daily financial ledgers.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  other: {
    'geo.region': 'ID',
    'geo.placename': 'Indonesia',
    'geo.position': '-0.789275;113.921327',
    'ICBM': '-0.789275, 113.921327',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white min-h-screen flex flex-col antialiased selection:bg-gold/30 selection:text-gold`}>
        <ThemeEnforcer />
        <Providers>
          <PriceTicker />
          <Navbar />
          <main className="flex-1 w-full relative z-20 content-reduced">
            {children}
          </main>
          <footer className="w-full relative z-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl py-12 mt-32">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
              <div className="flex justify-center mb-8">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-xl">
                   <img src="/logo.png" alt="Gold Tracker" className="w-8 h-8 object-contain" />
                 </div>
              </div>
              <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">
                Forged with Precision by <a href="https://alvianzf.id" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-white transition-colors">alvianzf.id</a>
              </p>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
                &copy; {new Date().getFullYear()} Gold Tracker Terminal — All Rights Reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
