'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Coins, Loader2 } from 'lucide-react';
import { useI18n } from '@/context/LanguageContext';
import ReceiptUploader from './ReceiptUploader';
import { formatCurrency } from '@/lib/utils';

export default function AddHoldingModal() {
  const { t } = useI18n();
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
        className="flex items-center gap-4 bg-gold hover:bg-gold-strong text-black font-black px-10 py-5 rounded-2xl shadow-gold transition-all hover:scale-105 active:scale-95 group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        <Plus className="w-6 h-6" />
        <span className="uppercase tracking-[0.2em] text-[10px]">{t('gold.add')}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 sm:p-10">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-2xl glass p-1.5 shadow-gold/10 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="glass bg-slate-900/80 border-white/5">
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 shadow-lg text-gold">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{t('gold.vaultEntry')}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1.5">{t('gold.bullionAcquisition')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-12 h-12 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <form className="p-10 space-y-10" onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.refinementStandard')}</label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-gold font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all appearance-none cursor-pointer [color-scheme:dark]"
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
                    <option value="ANTAM">Antam Certified</option>
                    <option value="UBS">UBS Precious Metals</option>
                    <option value="GALERI24">Galeri 24 Signature</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <Plus className="w-4 h-4 rotate-45" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.metricWeight')}</label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-black text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all appearance-none cursor-pointer [color-scheme:dark]"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  >
                    {(latestPrices
                      ? Array.from(new Set(latestPrices.filter((p: { type: string; weight: number }) => p.type === formData.type).map((p: { weight: number }) => p.weight))).sort((a: unknown, b: unknown) => (a as number) - (b as number))
                      : [0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000]
                    ).map((w: unknown) => (
                      <option key={w as number} value={w as number}>{w as number}g Bullion</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <Plus className="w-4 h-4 rotate-45" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.acquisitionCapital')}</label>
              <div className="relative group">
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-black text-xl focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                  placeholder="0.00"
                  value={formData.buyPrice ? formatCurrency(formData.buyPrice) : ''}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9]/g, '');
                    const num = parseInt(rawVal, 10);
                    setFormData(prev => ({ ...prev, buyPrice: isNaN(num) ? 0 : num }));
                  }}
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-bold uppercase tracking-widest text-xs">
                  Currency
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.ledgerDate')}</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all [color-scheme:dark]"
                  value={formData.buyDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyDate: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.archiveId')}</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                  placeholder="CERTIFICATE #"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('gold.auditTrail')}</label>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-inner">
                <ReceiptUploader 
                  receiptUrl={formData.receiptUrl} 
                  onUploadSuccess={handleUploadSuccess} 
                  onRemove={handleRemoveReceipt}
                  allowView={false}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gold hover:bg-gold-strong text-black font-black py-6 rounded-2xl shadow-gold transition-all flex items-center justify-center gap-4 hover:scale-105 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              {mutation.isPending ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                <>
                  <Coins className="w-6 h-6" />
                  <span className="uppercase tracking-[0.2em] text-[10px]">{t('gold.verifyAuthorize')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
