'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Trash2, Pencil, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, ImageIcon, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ActionMenu from './ActionMenu';
import FinanceModal from './modals/FinanceModal';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface FinanceTableProps {
  transactions: any[];
  isLoading: boolean;
}

export default function FinanceTable({ transactions, isLoading }: FinanceTableProps) {
  const queryClient = useQueryClient();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
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

  const handleDelete = (transaction: any) => {
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
      <div className="overflow-x-auto rounded-3xl border border-white/5 bg-slate-900/30 backdrop-blur-xl">
        <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal">
          <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Purpose & Source</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold text-center">Receipt</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleExpand(tx.id)}
                        className="p-1 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
                      >
                        {expandedRows.has(tx.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-medium">{new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-100 font-bold">{tx.purpose}</span>
                      <span className="text-slate-400 text-xs">{tx.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      tx.type === 'DEBIT' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      {tx.type === 'DEBIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-base font-bold ${tx.type === 'DEBIT' ? 'text-slate-100' : 'text-emerald-400'}`}>
                      {tx.type === 'DEBIT' ? '-' : '+'} Rp {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {tx.photoUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-slate-950 group/img cursor-pointer" onClick={() => window.open(tx.photoUrl, '_blank')}>
                          <Image src={tx.photoUrl} alt="Receipt" fill className="object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
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
                  <tr className="bg-slate-900/40 animate-in fade-in slide-in-from-top-2">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Transaction Details</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {tx.details || 'No additional details provided for this transaction.'}
                            </p>
                          </div>
                          {tx.photoUrl && (
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Receipt Attachment</h4>
                              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
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
