'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function PriceTicker() {
  const { data: prices } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: async () => {
      const { data } = await axios.get('/api/prices/latest');
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  const pathname = usePathname();

  if (!prices || prices.length === 0 || pathname === '/login') return null;

  // Group by type and just show the 1g version for the ticker to keep it slim
  const tickerItems = prices.filter((p: { weight: number }) => p.weight === 1);

  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="h-8 bg-slate-900/80 border-b border-white/5 flex overflow-hidden whitespace-nowrap items-center w-full">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex w-max"
      >
        <div className="flex gap-12 items-center px-6 pr-12">
          {duplicatedItems.map((item: { id: string; type: string; priceBuy: number }, i) => (
            <div key={`set1-${item.id}-${i}`} className="flex items-center gap-2 text-[11px] font-semibold tracking-wider">
              <span className="text-amber-500 uppercase">{item.type}</span>
              <span className="text-slate-200">
                Rp {item.priceBuy.toLocaleString('id-ID')}
              </span>
              <TrendingUp className="w-3 h-3 text-emerald-500 opacity-60" />
            </div>
          ))}
        </div>
        <div className="flex gap-12 items-center px-6 pr-12">
          {duplicatedItems.map((item: { id: string; type: string; priceBuy: number }, i) => (
            <div key={`set2-${item.id}-${i}`} className="flex items-center gap-2 text-[11px] font-semibold tracking-wider">
              <span className="text-amber-500 uppercase">{item.type}</span>
              <span className="text-slate-200">
                Rp {item.priceBuy.toLocaleString('id-ID')}
              </span>
              <TrendingUp className="w-3 h-3 text-emerald-500 opacity-60" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
