'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Wallet, Target, Percent } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Loader from './Loader';

export default function PortfolioStats() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      const { data } = await axios.get('/api/holdings');
      return data.summary;
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 glass bg-white/5 rounded-3xl flex items-center justify-center border-white/5">
          <Loader size="lg" />
        </div>
      ))}
    </div>
  );

  const stats = [
    {
      label: 'Portfolio Value',
      value: `Rp ${formatCurrency(summary?.totalValue)}`,
      icon: Wallet,
      color: 'text-white',
      bg: 'bg-gold/10',
      accent: 'text-gold'
    },
    {
      label: 'Total Profit',
      value: `${(summary?.totalProfit ?? 0) >= 0 ? '+' : ''}Rp ${formatCurrency(summary?.totalProfit)}`,
      icon: Target,
      color: (summary?.totalProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: 'bg-slate-900',
      accent: (summary?.totalProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
    },
    {
      label: 'Performance Index',
      value: `${(summary?.profitPercent ?? 0) >= 0 ? '+' : ''}${summary?.profitPercent?.toFixed(2) ?? '0.00'}%`,
      icon: Percent,
      color: (summary?.profitPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: 'bg-slate-900',
      accent: (summary?.profitPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {stats.map((stat, i) => (
        <div key={i} className="glass p-1 group">
          <div className="glass bg-white/5 p-10 flex flex-col justify-between h-full border-white/5 group-hover:border-gold/20 transition-all">
            <div className="flex items-center gap-5 mb-10">
              <div className={cn(
                "w-14 h-14 rounded-2xl border flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                stat.bg,
                stat.accent === 'text-gold' ? 'border-gold/20' : 'border-white/10',
                stat.accent
              )}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{stat.label}</span>
                <span className="text-[9px] font-bold text-gold/40 uppercase tracking-widest">Global Asset View</span>
              </div>
            </div>
            <div className={cn("text-4xl font-bold tracking-tighter drop-shadow-xl", stat.color)}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
