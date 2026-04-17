'use client';

import { X, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';

interface ViewModalProps {
  holding: {
    id: string;
    type: string;
    weight: number;
    buyPrice: number;
    buyDate: string;
    currentValue: number;
    pl: number;
    plPercent: number;
    serialNumber?: string;
    receiptUrl?: string;
  };
  onClose: () => void;
}

export default function ViewHoldingModal({ holding, onClose }: ViewModalProps) {
  if (!holding) return null;

  const isProfit = holding.pl >= 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-md glass p-1.5 shadow-gold/10 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="glass bg-slate-900/80 border-white/5">
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 shadow-lg text-gold">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Asset Intelligence</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1.5">Deep Analytics View</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="p-10 space-y-10">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Classification</p>
                <div className="bg-white/5 px-6 py-3 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-black text-white">{holding.type} Certified</h3>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pr-1">Total Mass</p>
                <div className="bg-gold/10 px-6 py-3 border border-gold/20 rounded-xl">
                  <h3 className="text-xl font-black text-gold">{holding.weight}g</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-5 border-b border-white/5 group">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">Inception Date</span>
                <span className="font-bold text-white tracking-tight">{format(new Date(holding.buyDate), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-white/5 group">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">Archive Serial</span>
                <span className="font-bold text-gold font-mono tracking-widest">{holding.serialNumber || 'NOCKA-NULL'}</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-white/5 group">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">Acquisition Delta</span>
                <span className="font-black text-white text-lg">Rp {formatCurrency(holding.buyPrice)}</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-white/5 group">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">Realized Valuation</span>
                <span className="font-black text-white text-lg animate-pulse">Rp {formatCurrency(holding.currentValue)}</span>
              </div>
              <div className="flex justify-between items-center py-6 group bg-white/[0.02] -mx-4 px-4 rounded-2xl">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">Net Performance</span>
                <div className={cn("inline-flex items-center gap-2.5 font-black text-lg", isProfit ? "text-emerald-400" : "text-rose-400")}>
                  {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  <span>Rp {formatCurrency(Math.abs(holding.pl))}</span>
                  <span className="text-xs bg-white/5 px-2 py-1 rounded-md opacity-70">({holding.plPercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            {holding.receiptUrl && (
              <div className="pt-4">
                <a 
                  href={holding.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl border border-white/10 transition-all hover:scale-105"
                >
                  <Eye className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-[0.2em] text-[10px]">Inspect Documentation</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
