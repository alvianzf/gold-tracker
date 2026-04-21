'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Calendar, Wallet, Tag, ArrowUpCircle, ArrowDownCircle, ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../Portal';
import Image from 'next/image';
import { formatInputCurrency, cleanNumericValue, cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface FinanceModalProps {
  onClose: () => void;
  transaction?: any; // If provided, we are in edit mode
}

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

  // Load last used source for new transactions
  useEffect(() => {
    if (!transaction) {
      const lastSource = localStorage.getItem('last_finance_source');
      if (lastSource) {
        setFormData(prev => ({ ...prev, source: lastSource }));
      }
    }
  }, [transaction]);

  const [displayAmount, setDisplayAmount] = useState('');

  const [customPurpose, setCustomPurpose] = useState('');
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);

  // Fetch dynamic purposes
  const { data: savedPurposes = [] } = useQuery<any[]>({
    queryKey: ['finance-purposes'],
    queryFn: async () => {
      const { data } = await axios.get('/api/finance/purposes');
      return data;
    },
  });

  // Delete purpose mutation
  const deletePurposeMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/finance/purposes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-purposes'] });
      showSuccessToast('Purpose removed');
    },
  });

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
      // If the purpose isn't available in the UI yet, we might need to handle it or just let it be selected manually
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
      setFormData(prev => ({ ...prev, photoUrl: res.data.url, thumbnailUrl: res.data.url }));
    } catch (err) {
      console.error('Upload failed:', err);
      showErrorToast('Upload failed');
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
        showSuccessToast('Chronicle updated');
      } else {
        await axios.post('/api/finance', payload);
        showSuccessToast('Entry committed to log');
        // Save source for next transaction
        localStorage.setItem('last_finance_source', formData.source);
      }
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-purposes'] });
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      showErrorToast('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurpose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remove this purpose from suggestions?')) {
      deletePurposeMutation.mutate(id);
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
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1.5">Financial Archive Entry</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Execution Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all [color-scheme:dark]"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Monetary Value (IDR)</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-black text-xl focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                    placeholder="0.00"
                    required
                    value={displayAmount}
                    onChange={e => setDisplayAmount(formatInputCurrency(e.target.value))}
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-bold uppercase tracking-widest text-[10px]">Currency</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Transaction Narrative</label>
              <textarea
                placeholder="Log the objective of this movement..."
                rows={3}
                value={formData.details}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-gold/40 focus:bg-white/10 transition-all resize-none text-sm placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Financial Channel</label>
              <input
                type="text"
                required
                placeholder="SAVINGS / WALLET / SALARY"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500 uppercase tracking-widest"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Flow Direction</label>
              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
                  className={cn(
                    "group relative overflow-hidden py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border",
                    formData.type === 'DEBIT' 
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-900/20" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center gap-3">
                    <ArrowDownCircle className={cn("w-4 h-4", formData.type === 'DEBIT' ? "text-rose-400" : "text-slate-500 group-hover:text-white")} />
                    Expense
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
                  className={cn(
                    "group relative overflow-hidden py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border",
                    formData.type === 'CREDIT' 
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-900/20" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center gap-3">
                    <ArrowUpCircle className={cn("w-4 h-4", formData.type === 'CREDIT' ? "text-emerald-400" : "text-slate-500 group-hover:text-white")} />
                    Income
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 pl-1">
                <Tag className="w-3.5 h-3.5" /> Analytical Tagging
              </label>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-8 shadow-inner">
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {savedPurposes.length > 0 ? (
                      savedPurposes.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group relative"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, purpose: p.name });
                              setShowCustomPurpose(false);
                            }}
                            className={cn(
                              "pl-6 pr-14 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              formData.purpose === p.name && !showCustomPurpose
                                ? "bg-gold text-black border-gold shadow-gold scale-105"
                                : "bg-white/5 border-white/10 text-slate-400 hover:border-gold/40 hover:text-gold"
                            )}
                          >
                            {p.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePurpose(e, p.id)}
                            className={cn(
                              "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 transition-all opacity-0 group-hover:opacity-100",
                              formData.purpose === p.name && !showCustomPurpose ? "text-black/40 hover:text-black" : "text-slate-600 hover:text-rose-500"
                            )}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] italic">Archive empty...</span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-8 border-t border-white/5 border-dashed">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Initialize new meta-tag..."
                      value={customPurpose}
                      onChange={(e) => {
                        setCustomPurpose(e.target.value);
                        setShowCustomPurpose(true);
                      }}
                      onFocus={() => setShowCustomPurpose(true)}
                      className={cn(
                        "flex-1 bg-white/5 border rounded-2xl px-6 py-4 text-xs font-bold outline-none transition-all placeholder:text-slate-500",
                        showCustomPurpose ? "border-gold/40 bg-white/10 shadow-gold/20" : "border-white/5"
                      )}
                    />
                    {showCustomPurpose && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomPurpose(false);
                          setCustomPurpose('');
                        }}
                        className="px-6 py-4 text-slate-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 pl-1">
                <ImageIcon className="w-3.5 h-3.5" /> Logical Verification
              </label>
              <div className="relative group rounded-3xl overflow-hidden border border-white/10">
                {formData.photoUrl ? (
                  <div className="relative h-64 w-full bg-slate-900 group">
                    <Image 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '', thumbnailUrl: '' })}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all scale-95 group-hover:scale-100"
                      >
                        Expunge Artifact
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-52 w-full bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group shadow-inner">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-gold animate-spin" />
                        <span className="text-[10px] text-gold font-black uppercase tracking-widest animate-pulse">Syncing...</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white/5 p-5 rounded-2xl mb-4 border border-white/10 group-hover:scale-110 group-hover:text-gold transition-all">
                          <Upload className="w-7 h-7 text-slate-500 group-hover:text-gold transition-colors" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Anchor Documentation</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </form>

          <footer className="p-10 border-t border-white/5 bg-slate-900/40">
            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="w-full bg-gold hover:bg-gold-strong text-black font-black py-6 rounded-2xl shadow-gold transition-all flex items-center justify-center gap-4 hover:scale-105 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                <>
                  <Wallet className="w-6 h-6" />
                  <span className="uppercase tracking-[0.2em] text-[10px]">{transaction ? 'Confirm Global Update' : 'Initialize Record Commitment'}</span>
                </>
              )}
            </button>
          </footer>
        </div>
      </div>
      </div>
    </Portal>
  );
}
