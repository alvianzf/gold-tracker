'use client';

import { X, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import ReceiptUploader from '../ReceiptUploader';
import Portal from '../Portal';

interface EditModalProps {
  holding: any;
  onClose: () => void;
}

export default function EditHoldingModal({ holding, onClose }: EditModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    buyPrice: holding.buyPrice,
    buyDate: new Date(holding.buyDate).toISOString().split('T')[0],
    serialNumber: holding.serialNumber || '',
    receiptUrl: holding.receiptUrl || ''
  });

  if (!holding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.put(`/api/holdings/${holding.id}`, {
        buyPrice: Number(formData.buyPrice),
        buyDate: new Date(formData.buyDate).toISOString(),
        serialNumber: formData.serialNumber,
        receiptUrl: formData.receiptUrl
      });
      await queryClient.invalidateQueries({ queryKey: ['holdings'] });
      onClose();
    } catch (error) {
      console.error('Failed to update holding', error);
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 sm:p-10">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl glass p-1.5 shadow-gold/10 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="glass bg-slate-900/80 border-white/5">
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 shadow-lg text-gold">
                <Plus className="w-8 h-8 rotate-45" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Modify Holding</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1.5">Asset Re-Authentication</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Acquisition Capital (Rp)</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    required
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-black text-xl focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Execution Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.buyDate}
                  onChange={(e) => setFormData({...formData, buyDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Archive ID / Serial</label>
              <input 
                type="text" 
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                placeholder="CERTIFICATE #"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Audit Documentation</label>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-inner">
                <ReceiptUploader 
                  receiptUrl={formData.receiptUrl}
                  onUploadSuccess={(url) => setFormData({...formData, receiptUrl: url})}
                  onRemove={() => setFormData({...formData, receiptUrl: ''})}
                  allowView={true}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-strong text-black font-black py-6 rounded-2xl shadow-gold transition-all flex items-center justify-center gap-4 hover:scale-105 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                <>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Verify Global Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
    </Portal>
  );
}
