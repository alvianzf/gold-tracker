'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Coins, Loader2 } from 'lucide-react';
import ReceiptUploader from './ReceiptUploader';

export default function AddHoldingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: latestPrices } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: async () => {
      const { data } = await axios.get('/api/prices/latest');
      return data;
    },
  });

  const [formData, setFormData] = useState({
    type: 'ANTAM',
    weight: 1,
    buyPrice: 0,
    buyDate: new Date().toISOString().split('T')[0],
    serialNumber: '',
    receiptUrl: '',
  });

  const mutation = useMutation({
    mutationFn: (newHolding: typeof formData) => {
      return axios.post('/api/holdings', newHolding);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
      setIsOpen(false);
      setFormData({
        type: 'ANTAM',
        weight: 1,
        buyPrice: 0,
        buyDate: new Date().toISOString().split('T')[0],
        serialNumber: '',
        receiptUrl: '',
      });
    },
  });

  const handleUploadSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, receiptUrl: url }));
  };

  const handleRemoveReceipt = () => {
    setFormData(prev => ({ ...prev, receiptUrl: '' }));
  };


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="w-5 h-5" />
        Add New Holding
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
              <Coins className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Add New Gold</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(formData);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Type</label>
              <select 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const newWeights = latestPrices
                    ? Array.from(new Set(latestPrices.filter((p: { type: string; weight: number }) => p.type === newType).map((p: { weight: number }) => p.weight))).sort((a: unknown, b: unknown) => (a as number) - (b as number))
                    : [0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000];
                    
                  let newWeight = formData.weight;
                  if (newWeights.length > 0 && !(newWeights as number[]).includes(newWeight)) {
                    newWeight = newWeights[0] as number;
                  }
                  
                  setFormData(prev => ({ ...prev, type: newType, weight: newWeight }));
                }}
              >
                <option value="ANTAM">Antam</option>
                <option value="UBS">UBS</option>
                <option value="GALERI24">Galeri 24</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Weight (g)</label>
              <select 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
              >
                {(latestPrices
                  ? Array.from(new Set(latestPrices.filter((p: { type: string; weight: number }) => p.type === formData.type).map((p: { weight: number }) => p.weight))).sort((a: unknown, b: unknown) => (a as number) - (b as number))
                  : [0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000]
                ).map((w: unknown) => (
                  <option key={w as number} value={w as number}>{w as number}g</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Purchase Price (Rp)</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
              placeholder="e.g. 1,500,000"
              value={formData.buyPrice ? formData.buyPrice.toLocaleString('en-US') : ''}
              onChange={(e) => {
                const rawVal = e.target.value.replace(/[^0-9]/g, '');
                const num = parseInt(rawVal, 10);
                setFormData(prev => ({ ...prev, buyPrice: isNaN(num) ? 0 : num }));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={formData.buyDate}
                onChange={(e) => setFormData(prev => ({ ...prev, buyDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Serial Number</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="Optional"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Receipt</label>
            <ReceiptUploader 
              receiptUrl={formData.receiptUrl} 
              onUploadSuccess={handleUploadSuccess} 
              onRemove={handleRemoveReceipt}
              allowView={false} // Minimal view in Add Form to save space, or we can enable view. Let's enable view!
            />
          </div>

          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all flex items-center justify-center gap-2"
          >
            {mutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Log Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
