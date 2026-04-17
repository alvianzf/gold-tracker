'use client';

import { useState } from 'react';
import { Plus, Wallet, TrendingUp } from 'lucide-react';
import FinanceTable from '@/components/FinanceTable';
import FinanceModal from '@/components/modals/FinanceModal';
import DailyInsight from '@/components/DailyInsight';
import FinanceAnalytics from '@/components/FinanceAnalytics';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Search, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

import { useI18n } from '@/context/LanguageContext';

export default function FinancePage() {
  const { t } = useI18n();
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
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in duration-1000">
      {/* Header Card */}
      <div className="glass p-1 md:p-1.5 shadow-gold/5">
        <div className="glass bg-slate-900/60 p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 border-white/5">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 text-gold">
              <div className="bg-gold/10 p-3 rounded-2xl border border-gold/20 shadow-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Portfolio Analytics</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
              {t('finance.title')}
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              {t('finance.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={cn(
                "group flex items-center gap-3 px-8 py-5 rounded-2xl font-bold transition-all text-sm border backdrop-blur-xl",
                showAnalytics
                  ? "bg-white/10 text-white border-white/20 shadow-xl"
                  : "bg-transparent text-slate-400 border-white/5 hover:bg-white/5"
              )}
            >
              <TrendingUp className={cn("w-5 h-5 transition-transform duration-500", showAnalytics ? "rotate-0" : "rotate-180")} />
              {showAnalytics ? (t('finance.hideAnalytics') || 'Hide Insights') : (t('finance.showAnalytics') || 'Show Insights')}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-3 bg-gold hover:bg-gold-strong text-black font-bold px-10 py-5 rounded-2xl shadow-gold transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> 
              {t('finance.newLog')}
            </button>
          </div>
        </div>
      </div>

      <div className="animate-in slide-in-from-top-4 duration-700">
        <DailyInsight />
      </div>

      {/* Filter Bar */}
      <section className="glass p-1.5 shadow-xl">
        <div className="glass bg-white/5 p-8 flex flex-col lg:flex-row items-center gap-8 border-white/5">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              placeholder={t('finance.searchPlaceholder') || 'Search the archives...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 rounded-2xl border border-white/10 py-5 pl-16 pr-8 text-base text-white font-bold focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-inner">
              <CalendarIcon className="w-5 h-5 text-gold" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent border-none text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
              />
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent border-none text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            
            <div className="flex gap-3">
              {[
                { label: t('finance.thisMonth') || 'This Month', range: { start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') } },
                { label: t('finance.lastMonth') || 'Last Month', range: { start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') } }
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => setDateRange(btn.range)}
                  className="px-6 py-4 bg-white/5 border border-white/5 hover:border-gold/20 hover:bg-gold/5 rounded-2xl text-[10px] font-bold text-slate-400 hover:text-gold uppercase tracking-widest transition-all"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showAnalytics && (
        <div className="animate-in zoom-in-95 duration-500">
          <FinanceAnalytics 
            transactions={filteredTransactions} 
            availableSources={Array.from(new Set(transactions?.map(tx => tx.source) || []))}
            availablePurposes={Array.from(new Set(transactions?.map(tx => tx.purpose) || []))}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: t('finance.totalBalance'), value: stats.balance, icon: Wallet, color: stats.balance >= 0 ? 'text-gold' : 'text-rose-400', sub: t('finance.selectedPeriod') },
          { label: t('finance.income'), value: stats.totalIncome, icon: TrendingUp, color: 'text-emerald-400', sub: t('finance.totalCredits') },
          { label: t('finance.expense'), value: stats.totalExpense, icon: TrendingUp, color: 'text-rose-400', sub: t('finance.totalDebits'), rotate: true }
        ].map((stat, i) => (
          <div key={i} className="glass p-1 group">
            <div className="glass bg-white/5 p-10 flex flex-col justify-between h-full border-white/5 group-hover:border-gold/20 transition-all">
              <div className="flex items-center gap-5 mb-10">
                <div className={cn("w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg", stat.color)}>
                  <stat.icon className={cn("w-7 h-7", stat.rotate && "rotate-180")} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{stat.label}</span>
                  <span className="text-[9px] font-bold text-gold/40 uppercase tracking-widest">{stat.sub}</span>
                </div>
              </div>
              <div className={cn("text-4xl font-bold tracking-tighter drop-shadow-xl", stat.label === t('finance.income') ? 'text-emerald-400' : 'text-white')}>
                {stat.label === t('finance.income') ? '+' : stat.label === t('finance.expense') ? '-' : ''} Rp {formatCurrency(Math.abs(stat.value))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="glass p-1.5 shadow-2xl animate-in slide-in-from-bottom-8 duration-1000">
        <div className="glass bg-slate-900/40 border-white/5">
          <FinanceTable transactions={filteredTransactions} isLoading={isLoading} />
        </div>
      </div>

      {isModalOpen && <FinanceModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
