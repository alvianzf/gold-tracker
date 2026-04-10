'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function HistoryPage() {
  const [filter, setFilter] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'date',
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);
      params.append('sortBy', filter.sortBy);
      
      const { data } = await axios.get(`/api/transactions?${params.toString()}`);
      return data;
    },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Transaction <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">Log</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-xl">
            Audit trailing of all gold buys and sells.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-200 px-5 py-3 rounded-2xl transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Filters */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select 
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="">All Assets</option>
            <option value="ANTAM">Antam</option>
            <option value="UBS">UBS</option>
            <option value="GALERI24">Galeri 24</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search serial / ref..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none"
          />
        </div>
      </section>

      {/* Transactions List */}
      <section className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-slate-500">Loading history...</div>
        ) : !transactions?.length ? (
          <div className="p-20 text-center text-slate-500">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-widest font-semibold">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Activity</th>
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-8 py-5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx: { id: string, date: string, type: string, price: number, holding: { type: string, weight: number } }) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 text-slate-400 font-medium">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {tx.type === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-100 uppercase letter-spacing-wide">
                      {tx.holding.type} <span className="text-slate-500 font-normal ml-1">({tx.holding.weight}g)</span>
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-bold text-amber-500">
                      Rp {tx.price.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
