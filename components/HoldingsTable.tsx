'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import ViewHoldingModal from './modals/ViewHoldingModal';
import EditHoldingModal from './modals/EditHoldingModal';
import ActionMenu from './ActionMenu';
import { formatCurrency, cn } from '@/lib/utils';
import { useI18n } from '@/context/LanguageContext';

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
  const { t } = useI18n();
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
      text: `This will permanently remove your ${holding.weight}g ${holding.type} holding. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#1e293b',
      confirmButtonText: 'Confirm Deletion',
      cancelButtonText: 'Cancel',
      background: '#0f172a',
      color: '#ffffff',
      customClass: {
        popup: 'glass border border-white/10 shadow-2xl',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/holdings/${holding.id}`);
          queryClient.invalidateQueries({ queryKey: ['holdings'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });

          Swal.fire({
            title: 'Expunged',
            text: 'Asset record has been permanently removed.',
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#34d399',
            customClass: {
              popup: 'glass border border-white/10 shadow-2xl',
            }
          });
        } catch {
          Swal.fire({
            title: 'Critical Failure',
            text: 'System could not process the deletion.',
            icon: 'error',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#f43f5e',
            customClass: {
              popup: 'glass border border-white/10 shadow-2xl',
            }
          });
        }
      }
    });
  };

  const handleSell = (holding: Holding) => {
    Swal.fire({
      title: 'Execute Liquidation?',
      text: `Are you sure you want to exit ${holding.weight}g of ${holding.type} at Rp ${formatCurrency(holding.currentValue)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fbbf24',
      cancelButtonColor: '#1e293b',
      confirmButtonText: 'Execute Trade',
      background: '#0f172a',
      color: '#ffffff',
      customClass: {
        popup: 'glass border border-white/10 shadow-2xl',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`/api/holdings/${holding.id}/sell`, { sellPrice: holding.currentValue });
          queryClient.invalidateQueries({ queryKey: ['holdings'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['portfolio-history'] });
          
          Swal.fire({
            title: 'Trade Executed',
            text: 'Your position has been completely liquidated.',
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#34d399',
            customClass: {
              popup: 'glass border border-white/10 shadow-2xl',
            }
          });
        } catch {
          Swal.fire({
            title: 'Execution Error',
            text: 'Failed to process the market sell order.',
            icon: 'error',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#f43f5e',
            customClass: {
              popup: 'glass border border-white/10 shadow-2xl',
            }
          });
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

  if (!holdings?.length) return (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
        <Tag className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">{t('gold.noHoldings')}</p>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto rounded-3xl">
        <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal border-separate border-spacing-0">
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] border-b border-white/10">{t('gold.type')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-center border-b border-white/10">{t('gold.weight')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] border-b border-white/10">{t('gold.buyPrice')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] border-b border-white/10">{t('gold.totalValue')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-right border-b border-white/10">{t('gold.profitValue')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-center border-b border-white/10">{t('gold.liquidity')}</th>
              <th className="px-6 py-4 font-bold text-gold uppercase text-[10px] tracking-[0.3em] text-right border-b border-white/10">{t('finance.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.map((holding) => (
              <tr key={holding.id} className="hover:bg-white/[0.04] transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-gold/20 flex items-center justify-center text-gold font-black text-lg shadow-lg group-hover:bg-gold group-hover:text-black transition-all">
                      {holding.type[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base tracking-tight leading-tight">{holding.type}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Vault Record</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center text-slate-100 font-black text-base tracking-tight">{holding.weight}g</td>
                <td className="px-6 py-5 text-slate-400 font-bold">Rp {formatCurrency(holding.buyPrice)}</td>
                <td className="px-6 py-5">
                  <span className="text-lg font-black text-white tracking-tighter drop-shadow-md">
                    Rp {formatCurrency(holding.currentValue)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border",
                    holding.pl >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  )}>
                    {holding.pl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {holding.plPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => handleSell(holding)}
                    className="flex items-center gap-3 bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 hover:text-gold uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    <Tag className="w-4 h-4" /> {t('gold.liquidity')}
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end">
                    <ActionMenu
                      actions={[
                        {
                          label: t('gold.vaultDetails'),
                          icon: Eye,
                          onClick: () => setViewHolding(holding),
                        },
                        {
                          label: t('gold.modifyRecord'),
                          icon: Pencil,
                          onClick: () => setEditHolding(holding),
                        },
                        {
                          label: t('gold.purgeArchive'),
                          icon: Trash2,
                          variant: 'danger',
                          onClick: () => handleDelete(holding),
                        },
                      ]}
                    />
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
