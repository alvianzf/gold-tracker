'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Wallet, Target, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PortfolioStats() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      // We'll calculate this client-side or add a dedicated API
      // For now, let's assume we have a simple summary endpoint
      const { data } = await axios.get('/api/holdings');
      
      const totalCost = data.reduce((acc: number, h: { buyPrice: number }) => acc + h.buyPrice, 0);
      const totalValue = data.reduce((acc: number, h: { currentValue: number }) => acc + h.currentValue, 0);
      const totalProfit = totalValue - totalCost;
      const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
      
      return { totalValue, totalCost, totalProfit, profitPercent };
    },
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-32 bg-slate-900/50 rounded-3xl animate-pulse" />
    ))}
  </div>;

  const stats = [
    {
      label: 'Portfolio Value',
      value: `Rp ${formatCurrency(summary?.totalValue)}`,
      icon: Wallet,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Total Profit',
      value: `Rp ${formatCurrency(summary?.totalProfit)}`,
      icon: Target,
      color: (summary?.totalProfit ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
      bg: (summary?.totalProfit ?? 0) >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
    {
      label: 'Total P/L %',
      value: `${summary?.profitPercent.toFixed(2)}%`,
      icon: Percent,
      color: (summary?.profitPercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
      bg: (summary?.profitPercent ?? 0) >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="relative overflow-hidden group bg-slate-900/50 border border-white/5 rounded-3xl p-6 transition-all hover:bg-slate-900/80">
          <div className="relative z-10 flex flex-col gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
        </div>
      ))}
    </div>
  );
}
