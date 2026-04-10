'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import ViewHoldingModal from './modals/ViewHoldingModal';
import EditHoldingModal from './modals/EditHoldingModal';

interface Holding {
  id: string;
  type: string;
  weight: number;
  buyPrice: number;
  buyDate: string;
  serialNumber?: string;
  receiptUrl?: string;
  pl: number;
  plPercent: number;
  currentValue: number;
}

export default function HoldingsTable() {
  const queryClient = useQueryClient();
  const [viewHolding, setViewHolding] = useState<Holding | null>(null);
  const [editHolding, setEditHolding] = useState<Holding | null>(null);

  const { data: holdings, isLoading } = useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/holdings');
      return data;
    },
  });

  const handleDelete = (holding: Holding) => {
    Swal.fire({
      title: 'Delete Holding?',
      text: `This will permanently remove your ${holding.weight}g ${holding.type} holding and all associated transactions. This action cannot be undone.`,
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
          await axios.delete(`/api/holdings/${holding.id}`);
          queryClient.invalidateQueries({ queryKey: ['holdings'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });

          Swal.fire({
            title: 'Deleted!',
            text: 'The holding has been permanently removed.',
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'border border-white/10 rounded-3xl',
            }
          });
        } catch {
          Swal.fire({
            title: 'Failed',
            text: 'Could not delete the holding. Please try again.',
            icon: 'error',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#f43f5e',
            customClass: {
              popup: 'border border-white/10 rounded-3xl',
            }
          });
        }
      }
    });
  };

  const handleSell = (holding: Holding) => {
    Swal.fire({
      title: 'Execute Sell Order?',
      text: `Are you sure you want to liquidate ${holding.weight}g of ${holding.type} at current market value (Rp ${holding.currentValue.toLocaleString('id-ID')})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Sell Now!',
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-white/10 rounded-3xl',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`/api/holdings/${holding.id}/sell`, { sellPrice: holding.currentValue });
          queryClient.invalidateQueries({ queryKey: ['holdings'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['portfolio-history'] });
          
          Swal.fire({
            title: 'Sold!',
            text: 'Your position has been completely liquidated.',
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'border border-white/10 rounded-3xl',
            }
          });
        } catch {
          Swal.fire({
            title: 'Failed',
            text: 'There was an issue processing the trade execution.',
            icon: 'error',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#f43f5e',
            customClass: {
              popup: 'border border-white/10 rounded-3xl',
            }
          });
        }
      }
    });
  };

  if (isLoading) return <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-16 bg-slate-900/50 rounded-xl" />
    ))}
  </div>;

  if (!holdings?.length) return (
    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/20">
      <p className="text-slate-400">No active holdings found.</p>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 font-semibold">Asset</th>
              <th className="px-6 py-4 font-semibold">Weight</th>
              <th className="px-6 py-4 font-semibold">Cost</th>
              <th className="px-6 py-4 font-semibold">Current Value</th>
              <th className="px-6 py-4 font-semibold text-right">P/L (%)</th>
              <th className="px-6 py-4 font-semibold text-center">Sell</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.map((holding) => (
              <tr key={holding.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                      {holding.type[0]}
                    </div>
                    <span className="font-semibold text-slate-100">{holding.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-300 font-medium">{holding.weight}g</td>
                <td className="px-6 py-5 text-slate-300 font-medium">Rp {holding.buyPrice.toLocaleString('id-ID')}</td>
                <td className="px-6 py-5 font-bold text-slate-100">
                  Rp {holding.currentValue.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className={`inline-flex items-center gap-1 font-bold ${holding.pl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {holding.pl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {holding.plPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => handleSell(holding)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3" /> Sell
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setViewHolding(holding)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="View details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditHolding(holding)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(holding)} className="p-2 hover:bg-white/10 rounded-lg text-rose-500/70 hover:text-rose-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewHolding && <ViewHoldingModal holding={viewHolding} onClose={() => setViewHolding(null)} />}
      {editHolding && <EditHoldingModal holding={editHolding} onClose={() => setEditHolding(null)} />}
    </>
  );
}
