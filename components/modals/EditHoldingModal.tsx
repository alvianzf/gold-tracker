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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-slate-800 mb-6">Edit Holding</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-black pl-1">Buy Price (Rp)</label>
            <input 
              type="number" 
              required
              value={formData.buyPrice}
              onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-black pl-1">Acquisition Date</label>
            <input 
              type="date" 
              required
              value={formData.buyDate}
              onChange={(e) => setFormData({...formData, buyDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-black pl-1">Serial Number</label>
            <input 
              type="text" 
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. LMAO-1234"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-black pl-1">Receipt</label>
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
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl shadow-sm transition-all mt-4 flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
