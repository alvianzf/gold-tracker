'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Calendar, Wallet, Tag, ArrowUpCircle, ArrowDownCircle, ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { formatInputCurrency, cleanNumericValue } from '@/lib/utils';

interface FinanceModalProps {
  onClose: () => void;
  transaction?: any; // If provided, we are in edit mode
}

const DEFAULT_PURPOSES = ['Food', 'Transport', 'Shopping', 'Salary'];

export default function FinanceModal({ onClose, transaction }: FinanceModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    type: 'DEBIT',
    purpose: '',
    details: '',
    photoUrl: '',
    thumbnailUrl: '',
  });

  const [displayAmount, setDisplayAmount] = useState('');

  const [customPurpose, setCustomPurpose] = useState('');
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().split('T')[0],
        amount: transaction.amount.toString(),
        source: transaction.source,
        type: transaction.type,
        purpose: transaction.purpose,
        details: transaction.details || '',
        photoUrl: transaction.photoUrl || '',
        thumbnailUrl: transaction.thumbnailUrl || '',
      });
      setDisplayAmount(formatInputCurrency(transaction.amount.toString()));
      if (!DEFAULT_PURPOSES.includes(transaction.purpose)) {
        setShowCustomPurpose(true);
        setCustomPurpose(transaction.purpose);
      }
    }
  }, [transaction]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await axios.post('/api/upload', data);
      setFormData(prev => ({ ...prev, photoUrl: res.data.url, thumbnailUrl: res.data.url })); // Using same for now as placeholder
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalPurpose = showCustomPurpose ? customPurpose : formData.purpose;

    if (!finalPurpose) {
      alert('Please specify a purpose for this transaction.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(cleanNumericValue(displayAmount)),
        purpose: finalPurpose,
      };

      if (transaction) {
        await axios.patch(`/api/finance/${transaction.id}`, payload);
      } else {
        await axios.post('/api/finance', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800">{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (Rp)</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0"
                value={displayAmount}
                onChange={e => setDisplayAmount(formatInputCurrency(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Details (Optional)</label>
            <textarea
              placeholder="Add some notes about this transaction..."
              rows={2}
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-amber-500 transition-colors resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Source</label>
            <input
              type="text"
              required
              placeholder="e.g. Bank Account, Cash, e-Wallet"
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
                className={`py-3 rounded-xl font-black text-sm transition-all border ${
                  formData.type === 'DEBIT' 
                    ? 'bg-rose-100 border-rose-200 text-rose-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
                className={`py-3 rounded-xl font-black text-sm transition-all border ${
                  formData.type === 'CREDIT' 
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3 h-3" /> Purpose
            </label>
            {!showCustomPurpose ? (
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PURPOSES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, purpose: p })}
                    className={`py-2 rounded-lg border text-sm font-bold transition-all ${
                      formData.purpose === p 
                        ? 'bg-amber-100 border-amber-200 text-amber-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomPurpose(true)}
                  className="py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:bg-slate-50 transition-all col-span-2"
                >
                  + Add Custom Purpose
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter purpose..."
                  value={customPurpose}
                  onChange={e => setCustomPurpose(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomPurpose(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 text-sm transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Photo (Optional)
            </label>
            <div className="relative group">
              {formData.photoUrl ? (
                <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <Image 
                    src={formData.photoUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '', thumbnailUrl: '' })}
                      className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-xs text-slate-400 font-bold">Click to upload receipt</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
