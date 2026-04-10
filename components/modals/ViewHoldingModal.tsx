'use client';

import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Holding Details</h2>

        <div className="space-y-0">
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Asset</span>
            <span className="font-bold text-slate-100 uppercase">{holding.type}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Weight</span>
            <span className="font-bold text-slate-100">{holding.weight}g</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Buy Price</span>
            <span className="font-mono text-slate-100">Rp {holding.buyPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Current Value</span>
            <span className="font-mono font-bold text-amber-500">Rp {holding.currentValue.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Profit / Loss</span>
            <div className={`inline-flex items-center gap-1.5 font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-mono">Rp {Math.abs(holding.pl).toLocaleString('id-ID')}</span>
              <span className="text-xs opacity-70">({holding.plPercent.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Acquired Date</span>
            <span className="text-slate-100">{format(new Date(holding.buyDate), 'PPP')}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400 text-sm">Serial Number</span>
            <span className="font-mono text-slate-300">{holding.serialNumber || 'N/A'}</span>
          </div>
          {holding.receiptUrl && (
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 text-sm">Receipt</span>
              <a href={holding.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline text-sm font-bold">
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
