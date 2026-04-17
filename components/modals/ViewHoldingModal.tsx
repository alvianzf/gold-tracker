'use client';

import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Holding Details</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Asset Type</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{holding.type}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Weight</p>
              <h3 className="text-2xl font-black text-amber-600 leading-none">{holding.weight}g</h3>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-bold">Buy Date</span>
              <span className="font-bold text-slate-800">{format(new Date(holding.buyDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-bold">Serial Number</span>
              <span className="font-bold text-slate-800 font-mono">{holding.serialNumber || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-bold">Buy Price</span>
              <span className="font-bold text-slate-800">Rp {formatCurrency(holding.buyPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-bold">Current Value</span>
              <span className="font-black text-amber-600">Rp {formatCurrency(holding.currentValue)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-bold">Profit / Loss</span>
              <div className={`inline-flex items-center gap-1.5 font-black ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>Rp {formatCurrency(Math.abs(holding.pl))}</span>
                <span className="text-xs opacity-70">({holding.plPercent.toFixed(2)}%)</span>
              </div>
            </div>
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
