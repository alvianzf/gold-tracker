import PortfolioStats from '@/components/PortfolioStats';
import HoldingsTable from '@/components/HoldingsTable';
import AddHoldingModal from '@/components/AddHoldingModal';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Live Portfolio</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Asset <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">Overview</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-xl">
            Real-time tracking of your precious metal investments. Monitor performance across Antam, UBS, and Galeri 24.
          </p>
        </div>
        <AddHoldingModal />
      </header>

      <section>
        <PortfolioStats />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Active Holdings
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-slate-500 border border-white/5 uppercase">
              Spot Market
            </span>
          </h2>
        </div>
        <HoldingsTable />
      </section>
    </div>
  );
}
