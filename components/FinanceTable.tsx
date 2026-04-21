'use client';

import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Trash2, Pencil, ArrowUpCircle, ArrowDownCircle, ImageIcon, ChevronDown, ChevronRight, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ActionMenu from './ActionMenu';
import FinanceModal from './modals/FinanceModal';
import Image from 'next/image';
import { formatCurrency, cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useI18n } from '@/context/LanguageContext';

export interface FinanceTransaction {
  id: string;
  date: string;
  purpose: string;
  source: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  photoUrl?: string;
  details?: string;
}

interface FinanceTableProps {
  transactions: FinanceTransaction[];
  isLoading: boolean;
}

export default function FinanceTable({ transactions, isLoading }: FinanceTableProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = (transaction: FinanceTransaction) => {
    Swal.fire({
      title: 'Delete Transaction?',
      text: `Are you sure you want to delete this ${transaction.type.toLowerCase()} record of Rp ${transaction.amount.toLocaleString('id-ID')}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#0f172a',
      customClass: {
        popup: 'border border-slate-200  shadow-doodle',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/finance/${transaction.id}`);
          queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
          showSuccessToast('Transaction entry removed');
        } catch (err) {
          console.error(err);
          showErrorToast('Failed to remove transaction');
        }
      }
    });
  };

  if (isLoading) return (
    <div className="space-y-6 p-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  if (!transactions?.length) return (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
        <Wallet className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">{t('finance.noTransactions')}</p>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto rounded-3xl">
        <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal border-collapse">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/10">
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em]">{t('finance.date')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em]">{t('finance.purposeSource')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em]">{t('finance.type')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em]">{t('finance.amount')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-center">{t('finance.receipt')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-right">{t('finance.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <tr className="hover:bg-white/[0.04] transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => toggleExpand(tx.id)}
                        className={cn(
                          "p-2 rounded-xl border transition-all",
                          expandedRows.has(tx.id) 
                            ? "bg-gold text-black border-gold shadow-gold" 
                            : "bg-white/5 text-slate-400 border-white/10 hover:border-gold/30 hover:text-white"
                        )}
                      >
                        {expandedRows.has(tx.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-white font-bold tracking-tight text-sm">{new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-100 font-bold text-base leading-tight mb-1">{tx.purpose}</span>
                      <span className="text-gold/60 text-[10px] font-bold uppercase tracking-widest">{tx.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase border shadow-sm",
                      tx.type === 'DEBIT' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    )}>
                      {tx.type === 'DEBIT' ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-lg font-bold tracking-tighter drop-shadow-md",
                      tx.type === 'DEBIT' ? 'text-white' : 'text-emerald-400'
                    )}>
                      {tx.type === 'DEBIT' ? '-' : '+'} Rp {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {tx.photoUrl ? (
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-white/5 group/img cursor-pointer transition-all hover:scale-110 hover:border-gold shadow-lg" onClick={() => window.open(tx.photoUrl, '_blank')}>
                          <Image src={tx.photoUrl} alt="Receipt" fill className="object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-0.5 bg-white/10 rounded-full" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end">
                      <ActionMenu
                        actions={[
                          {
                            label: t('finance.editEntry'),
                            icon: Pencil,
                            onClick: () => setEditingTransaction(tx),
                          },
                          {
                            label: t('finance.voidRecord'),
                            icon: Trash2,
                            variant: 'danger',
                            onClick: () => handleDelete(tx),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
                {expandedRows.has(tx.id) && (
                  <tr className="bg-white/[0.02] animate-in fade-in slide-in-from-top-4 duration-500">
                    <td colSpan={6} className="px-10 py-10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gold shadow-gold" />
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Audit Details</h4>
                          </div>
                          <div className="glass bg-white/5 p-8 border-white/10 shadow-inner">
                            <p className="text-slate-300 text-base font-medium leading-relaxed italic">
                              "{tx.details || t('finance.noDetails')}"
                            </p>
                          </div>
                        </div>
                        {tx.photoUrl && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-gold shadow-gold" />
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Receipt Evidence</h4>
                            </div>
                            <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl group/fullimg cursor-zoom-in" onClick={() => window.open(tx.photoUrl, '_blank')}>
                              <Image src={tx.photoUrl} alt="Full Receipt" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 opacity-0 group-hover/fullimg:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Click to enlarge evidence</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editingTransaction && (
        <FinanceModal 
          transaction={editingTransaction} 
          onClose={() => setEditingTransaction(null)} 
        />
      )}
    </>
  );
}
