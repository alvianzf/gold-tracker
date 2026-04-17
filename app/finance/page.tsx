'use client';

import { useState } from 'react';
import { Plus, Wallet, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import FinanceTable from '@/components/FinanceTable';
import FinanceModal from '@/components/modals/FinanceModal';
import DailyInsight from '@/components/DailyInsight';
import FinanceAnalytics from '@/components/FinanceAnalytics';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export default function FinancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);

  const { data: transactions, isLoading } = useQuery<any[]>({
    queryKey: ['finance-transactions'],
    queryFn: async () => {
      const { data } = await axios.get('/api/finance');
      return data;
    },
  });

  const filteredTransactions = transactions?.filter(tx => {
    const date = new Date(tx.date).toISOString().split('T')[0];
    const matchesDate = date >= dateRange.start && date <= dateRange.end;
    const matchesSearch = tx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tx.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  }) || [];

  const stats = {
    totalIncome: filteredTransactions.filter(tx => tx.type === 'CREDIT').reduce((acc, tx) => acc + tx.amount, 0),
    totalExpense: filteredTransactions.filter(tx => tx.type === 'DEBIT').reduce((acc, tx) => acc + tx.amount, 0),
    balance: 0,
  };
  stats.balance = stats.totalIncome - stats.totalExpense;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Finance Tracker</h1>
          <p className="text-slate-400 mt-1">Manage your daily expenses and income with precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all border ${
              showAnalytics ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" /> {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      <DailyInsight />

      {/* Filter Bar */}
      <section className="bg-slate-900/30 border border-white/5 p-4 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by purpose, source or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-950/50 border border-white/5 rounded-2xl px-4 py-2">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <input 
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-transparent border-none text-xs text-white focus:outline-none"
          />
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <input 
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-transparent border-none text-xs text-white focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
            {[
              { label: 'This Month', range: { start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') } },
              { label: 'Last Month', range: { start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') } }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => setDateRange(btn.range)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-all"
              >
                {btn.label}
              </button>
            ))}
        </div>
      </section>

      {showAnalytics && <FinanceAnalytics transactions={filteredTransactions} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Total Balance</span>
          </div>
          <div className={`text-2xl font-black ${stats.balance >= 0 ? 'text-white' : 'text-rose-500'}`}>
            Rp {formatCurrency(stats.balance)}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Income</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            Rp {formatCurrency(stats.totalIncome)}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Expenses</span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            Rp {formatCurrency(stats.totalExpense)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Receipt className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
        </div>
        <FinanceTable transactions={filteredTransactions} isLoading={isLoading} />
      </div>

      {isModalOpen && <FinanceModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
