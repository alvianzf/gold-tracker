'use client';

import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import ReceiptUploader from '../ReceiptUploader';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Edit Holding</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold pl-1">Buy Price (Rp)</label>
            <input 
              type="number" 
              required
              value={formData.buyPrice}
              onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold pl-1">Acquisition Date</label>
            <input 
              type="date" 
              required
              value={formData.buyDate}
              onChange={(e) => setFormData({...formData, buyDate: e.target.value})}
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold pl-1">Serial Number</label>
            <input 
              type="text" 
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              placeholder="e.g. LMAO-1234"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold pl-1">Receipt</label>
            <ReceiptUploader 
              receiptUrl={formData.receiptUrl}
              onUploadSuccess={(url) => setFormData({...formData, receiptUrl: url})}
              onRemove={() => setFormData({...formData, receiptUrl: ''})}
              allowView={true}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 rounded-xl transition-all mt-4 flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
