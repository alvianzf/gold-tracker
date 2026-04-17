'use client';

import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Trash2, Pencil, ArrowUpCircle, ArrowDownCircle, ImageIcon, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ActionMenu from './ActionMenu';
import FinanceModal from './modals/FinanceModal';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

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
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-white/10 rounded-3xl',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/finance/${transaction.id}`);
          queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
          Swal.fire({
            title: 'Deleted!',
            text: 'Transaction entry has been removed.',
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'border border-white/10 rounded-3xl',
            }
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'Failed to delete the transaction.',
            icon: 'error',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#f43f5e',
          });
        }
      }
    });
  };

  if (isLoading) return <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-20 bg-slate-900/50 rounded-2xl animate-pulse" />
    ))}
  </div>;

  if (!transactions?.length) return (
    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/20">
      <p className="text-slate-400">No transactions recorded yet.</p>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Purpose & Source</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold text-center">Receipt</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleExpand(tx.id)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                      >
                        {expandedRows.has(tx.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold">{new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">{new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black">{tx.purpose}</span>
                      <span className="text-slate-500 text-xs font-medium">{tx.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      tx.type === 'DEBIT' 
                        ? 'bg-rose-50 border-rose-100 text-rose-600' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                      {tx.type === 'DEBIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-base font-black ${tx.type === 'DEBIT' ? 'text-slate-700' : 'text-emerald-600'}`}>
                      {tx.type === 'DEBIT' ? '-' : '+'} Rp {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {tx.photoUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group/img cursor-pointer" onClick={() => window.open(tx.photoUrl, '_blank')}>
                          <Image src={tx.photoUrl} alt="Receipt" fill className="object-cover" />
                          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end">
                      <ActionMenu
                        actions={[
                          {
                            label: 'Edit',
                            icon: Pencil,
                            onClick: () => setEditingTransaction(tx),
                          },
                          {
                            label: 'Delete',
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
                  <tr className="bg-slate-50/50 animate-in fade-in slide-in-from-top-2 border-t border-slate-100">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="flex flex-col gap-4 text-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Transaction Details</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {tx.details || 'No additional details provided for this transaction.'}
                            </p>
                          </div>
                          {tx.photoUrl && (
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Receipt Attachment</h4>
                              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                <Image src={tx.photoUrl} alt="Full Receipt" fill className="object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
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
