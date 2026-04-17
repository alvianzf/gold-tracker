'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function PriceTicker() {
  const { data: prices } = useQuery({
    queryKey: ['ticker-prices'],
    queryFn: async () => {
      const { data } = await axios.get('/api/prices/ticker');
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  const pathname = usePathname();

  if (!prices || prices.length === 0 || pathname === '/login') return null;

  // Duplicate enough times to ensure the scroll looks seamless
  const duplicatedItems = [...prices, ...prices, ...prices, ...prices, ...prices, ...prices];

  return (
    <div className="h-10 bg-black border-y border-white/5 flex overflow-hidden whitespace-nowrap items-center w-full z-30 shadow-2xl relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
      
      <div
        className="flex w-max animate-scroll"
        style={{ willChange: 'transform' }}
      >
        {/* Repeating groups to ensure seamless loop */}
        {[...Array(4)].map((_, groupIdx) => (
          <div key={groupIdx} className="flex gap-16 items-center px-8">
            {prices.map((item: { id: string; type: string; priceBuy: number; trend: 'up' | 'down' | 'stable' }, i: number) => (
              <div key={`${groupIdx}-${item.id}-${i}`} className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] relative group">
                <span className="text-gold uppercase group-hover:text-white transition-colors">{item.type}</span>
                <span className="text-slate-400 font-bold tracking-tighter text-[12px] group-hover:text-white transition-colors">
                  Rp {formatCurrency(item.priceBuy)}
                </span>
                <div className="flex items-center justify-center">
                  {item.trend === 'up' && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[8px] animate-pulse">BULLISH</span>
                    </div>
                  )}
                  {item.trend === 'down' && (
                    <div className="flex items-center gap-1 text-rose-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span className="text-[8px] animate-pulse text-rose-500">BEARISH</span>
                    </div>
                  )}
                  {item.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-700 opacity-60" />}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10 ml-4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
