'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import TrendChart from '@/components/TrendChart';
import { BarChart3, TrendingUp, History } from 'lucide-react';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [selectedType, setSelectedType] = useState('ANTAM');

  const { data: priceHistory } = useQuery({
    queryKey: ['price-history', selectedType, range],
    queryFn: async () => {
      const { data } = await axios.get(`/api/prices/history?type=${selectedType}&range=${range}`);
      return data;
    },
  });

  const { data: portfolioHistory } = useQuery({
    queryKey: ['portfolio-history', range],
    queryFn: async () => {
      const { data } = await axios.get(`/api/portfolio/history?range=${range}`);
      return data;
    },
  });

  const latestProfit = portfolioHistory?.length 
    ? portfolioHistory[portfolioHistory.length - 1].totalProfit 
    : 0;
  const isPositive = latestProfit >= 0;
  const plColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Market <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-xl">
            Visualizing trends and portfolio performance over time.
          </p>
        </div>
        
        <div className="flex bg-slate-900 border border-white/5 p-1 rounded-2xl">
          {['7d', '30d', '90d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                range === r ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Value Trend */}
        <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Portfolio Value</h2>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-6">Historical aggregation of all active holdings.</p>
          <TrendChart 
            data={portfolioHistory || []} 
            dataKey="totalValue" 
            color="#10b981" 
            label="Total Value" 
          />
        </section>

        {/* Price Trends */}
        <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Market Spot Price</h2>
            </div>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold text-amber-500 outline-none"
            >
              <option value="ANTAM">ANTAM</option>
              <option value="UBS">UBS</option>
              <option value="GALERI24">GALERI 24</option>
            </select>
          </div>
          <p className="text-sm text-slate-500 mb-6">Spot price history (per gram) for selected asset.</p>
          <TrendChart 
            data={priceHistory || []} 
            dataKey="priceBuy" 
            color="#f59e0b" 
            label="Buy Price" 
          />
        </section>
      </div>

      {/* P/L History */}
      <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Profit & Loss Trend</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">Tracking your net gains day-by-day.</p>
        <TrendChart 
          data={portfolioHistory || []} 
          dataKey="totalProfit" 
          color={plColor} 
          label="Net Profit" 
          type="line"
        />
      </section>
    </div>
  );
}
