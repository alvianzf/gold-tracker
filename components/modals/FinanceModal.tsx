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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-3 h-3" /> Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={displayAmount}
                  onChange={e => setDisplayAmount(formatInputCurrency(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details (Optional)</label>
            <textarea
              placeholder="Add some notes about this transaction..."
              rows={2}
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-amber-500/50 transition-colors resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</label>
            <input
              type="text"
              required
              placeholder="e.g. Bank Account, Cash, e-Wallet"
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  formData.type === 'DEBIT' 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" /> Debit (Expense)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  formData.type === 'CREDIT' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" /> Credit (Income)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3 h-3" /> Purpose
            </label>
            {!showCustomPurpose ? (
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PURPOSES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, purpose: p })}
                    className={`py-2 rounded-lg border text-sm transition-all ${
                      formData.purpose === p 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomPurpose(true)}
                  className="py-2 rounded-lg border border-dashed border-white/20 text-slate-400 text-sm hover:border-white/40 transition-all col-span-2"
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
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomPurpose(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Photo (Optional)
            </label>
            <div className="relative group">
              {formData.photoUrl ? (
                <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                  <Image 
                    src={formData.photoUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '', thumbnailUrl: '' })}
                      className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Delete Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 w-full rounded-2xl border-2 border-dashed border-white/5 bg-slate-950 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-600 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Click to upload receipt photo</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : transaction ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
