'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar, History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useI18n } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';

export default function HistoryPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'date',
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['transactions', filter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);
      params.append('sortBy', filter.sortBy);
      params.append('page', page.toString());
      params.append('limit', '20');
      const { data } = await axios.get(`/api/transactions?${params.toString()}`);
      return data;
    },
  });

  const transactions = response?.data || [];
  const totalPages = response?.totalPages || 0;

  const handleFilterChange = (updates: any) => {
    setFilter(prev => ({ ...prev, ...updates }));
    setPage(1); // Reset to first page on filter change
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 pt-10 px-6 content-reduced">
      {/* Header, Filters, and other details remain the same */}
      <header className="glass-header p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <div className="bg-gold/10 p-2 rounded-xl border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">{t('history.title')}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            TRANSACTION <span className="text-gold">CHRONICLE</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
            {t('history.subtitle')}
          </p>
        </div>

        <button className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black px-12 py-6 rounded-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 overflow-hidden">
          <Download className="w-6 h-6 text-gold" />
          <span className="uppercase tracking-[0.2em] text-[10px]">{t('history.export')}</span>
        </button>
      </header>

      {/* Filters */}
      <section className="glass p-1 md:p-1.5 shadow-gold/5 sticky top-28 z-30 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="glass bg-slate-900/80 p-6 sm:p-10 border-white/5 grid grid-cols-1 md:grid-cols-4 gap-8 backdrop-blur-2xl">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('history.classification')}</label>
            <div className="relative group/input">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-gold transition-colors" />
              <select
                value={filter.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="" className="bg-slate-900">ALL ASSET TYPES</option>
                <option value="ANTAM" className="bg-slate-900">ANTAM CERTIFIED</option>
                <option value="UBS" className="bg-slate-900">UBS CERTIFIED</option>
                <option value="GALERI24" className="bg-slate-900">GALERI 24</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('history.inceptionStart')}</label>
            <div className="relative group/input">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-gold transition-colors" />
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('history.inceptionEnd')}</label>
            <div className="relative group/input">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-gold transition-colors" />
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('history.patternSearch')}</label>
            <div className="relative group/input">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-gold transition-colors" />
              <input
                type="text"
                placeholder="ID / HASH / SERIAL"
                value={filter.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="glass p-1.5 shadow-gold/5 group">
        <div className="glass bg-slate-900/60 border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center gap-6 text-gold animate-pulse">
               <Loader2 className="w-12 h-12 animate-spin" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Ledgers...</span>
            </div>
          ) : !transactions?.length ? (
            <div className="p-32 text-center text-slate-500 font-bold uppercase tracking-[0.3em]">{t('history.noChronicles')}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('history.sequenceDate')}</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('history.operation')}</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('history.assetIntelligence')}</th>
                      <th className="px-10 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('history.executionDelta')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-white/[0.04] transition-all group/row">
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover/row:bg-gold group-hover/row:text-black transition-all border border-white/10 group-hover/row:border-gold shadow-lg">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-lg font-black text-white group-hover/row:translate-x-1 transition-transform">{format(new Date(tx.date), 'dd MMMM yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className={cn(
                            "inline-flex items-center gap-3 px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] border shadow-inner",
                            tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            {tx.type === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {tx.type}
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-white tracking-tight group-hover/row:text-gold transition-colors">{tx.holding.type}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-none mt-2">{tx.holding.weight} GRAM CERTIFIED</span>
                          </div>
                        </td>
                        <td className="px-10 py-10 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-white tracking-tighter group-hover/row:scale-110 transition-transform origin-right">Rp {tx.price.toLocaleString('id-ID')}</span>
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">Market Execution</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageChange={setPage} 
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
