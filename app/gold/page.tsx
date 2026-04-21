'use client';

import PortfolioStats from '@/components/PortfolioStats';
import HoldingsTable from '@/components/HoldingsTable';
import AddHoldingModal from '@/components/AddHoldingModal';
import { Coins } from 'lucide-react';
import { useI18n } from '@/context/LanguageContext';

export default function Dashboard() {
  const { t } = useI18n();

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in duration-1000">
      <header className="glass p-1 md:p-1.5 shadow-gold/5">
        <div className="glass bg-slate-900/60 p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 border-white/5">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 text-gold">
              <div className="bg-gold/10 p-3 rounded-2xl border border-gold/20 shadow-lg">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Bullion Reserves</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
              {t('gold.title')}
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              {t('gold.subtitle')}
            </p>
          </div>
          <div className="shrink-0 group">
            <AddHoldingModal />
          </div>
        </div>
      </header>

      <section className="animate-in slide-in-from-top-6 duration-700">
        <PortfolioStats />
      </section>

      <section className="space-y-10 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Holdings</h2>
            <div className="h-px w-20 bg-white/10" />
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/20">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-gold" />
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">
                Live Market Sync
              </span>
            </div>
          </div>
        </div>
        
        <div className="glass p-1.5 shadow-2xl animate-in slide-in-from-bottom-8 duration-1000">
          <div className="glass bg-slate-900/40 border-white/5">
            <HoldingsTable />
          </div>
        </div>
      </section>
    </div>
  );
}
