import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, PieChart as PieChartIcon, ArrowRightLeft, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FinanceTransaction } from './FinanceTable';

interface FinanceAnalyticsProps {
  transactions: FinanceTransaction[];
  globalTransactions?: FinanceTransaction[];
  availableSources: string[];
  availablePurposes: string[];
}

interface ChartItem {
  name: string;
  value: number;
}

interface ComparisonItem {
  date: string;
  income: number;
  expense: number;
}

const COLORS = ['#fbbf24', '#818cf8', '#34d399', '#fb7185', '#a78bfa', '#f472b6'];

export default function FinanceAnalytics({ 
  transactions, 
  globalTransactions = [],
  availableSources = [], 
  availablePurposes = [] 
}: FinanceAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSource, setActiveSource] = useState<string>('ALL');
  const [activePurpose, setActivePurpose] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sources = useMemo(() => ['ALL', ...availableSources.sort()], [availableSources]);
  const purposes = useMemo(() => ['ALL', ...availablePurposes.sort()], [availablePurposes]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      (activeSource === 'ALL' || t.source === activeSource) &&
      (activePurpose === 'ALL' || t.purpose === activePurpose)
    );
  }, [transactions, activeSource, activePurpose]);

  // Aggregate data for Pie Chart (Expense by Purpose)
  const expensesByPurpose = filteredTransactions
    .filter(tx => tx.type === 'DEBIT')
    .reduce((acc: ChartItem[], tx) => {
      const existing = acc.find(item => item.name === tx.purpose);
      if (existing) {
        existing.value += tx.amount;
      } else {
        acc.push({ name: tx.purpose, value: tx.amount });
      }
      return acc;
    }, []);

  // Aggregate data for Bar Chart (Income vs Expense)
  const comparisonData = useMemo(() => {
    // 1. Calculate Global Totals (Ignoring filters) for the same dates
    const globalAggregates = (globalTransactions.length > 0 ? globalTransactions : transactions).reduce((acc: Record<string, { income: number, expense: number }>, tx) => {
      const date = new Date(tx.date).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' });
      if (!acc[date]) acc[date] = { income: 0, expense: 0 };
      if (tx.type === 'CREDIT') acc[date].income += tx.amount;
      else acc[date].expense += tx.amount;
      return acc;
    }, {});

    // 2. Calculate Filtered Totals
    const filteredAcc = filteredTransactions.reduce((acc: Record<string, { income: number, expense: number }>, tx) => {
      const date = new Date(tx.date).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' });
      if (!acc[date]) acc[date] = { income: 0, expense: 0 };
      if (tx.type === 'CREDIT') acc[date].income += tx.amount;
      else acc[date].expense += tx.amount;
      return acc;
    }, {});

    // 3. Merge into Chart Format (Last 7 days of activity)
    const dates = Array.from(new Set([...Object.keys(globalAggregates), ...Object.keys(filteredAcc)]))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7);

    return dates.map(date => ({
      date,
      income: filteredAcc[date]?.income || 0,
      expense: filteredAcc[date]?.expense || 0,
      totalIncome: globalAggregates[date]?.income || 0,
      totalExpense: globalAggregates[date]?.expense || 0
    }));
  }, [transactions, filteredTransactions]);

  const totalIncome = filteredTransactions.filter(tx => tx.type === 'CREDIT').reduce((a, b) => a + b.amount, 0);
  const totalExpense = filteredTransactions.filter(tx => tx.type === 'DEBIT').reduce((a, b) => a + b.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;

  return (
    <div className="space-y-10 mb-16 animate-in fade-in duration-1000">
      {/* Search & Filters */}
      <div className="glass p-1.5 shadow-xl">
        <div className="glass bg-white/5 p-8 flex flex-wrap items-center gap-6 border-white/5">
          <div className="flex items-center gap-3 text-gold">
              <Filter className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Filter Reality</span>
          </div>
          <div className="flex flex-wrap gap-4">
              <select 
                  value={activeSource}
                  onChange={(e) => setActiveSource(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold text-white outline-none focus:border-gold/40 transition-all cursor-pointer [color-scheme:dark]"
              >
                  <option value="ALL">All Sources</option>
                  {sources.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                  value={activePurpose}
                  onChange={(e) => setActivePurpose(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold text-white outline-none focus:border-gold/40 transition-all cursor-pointer [color-scheme:dark]"
              >
                  <option value="ALL">All Purposes</option>
                  {purposes.filter(p => p !== 'ALL').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Purpose Breakdown */}
        <div className="glass p-1 group">
          <section className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
              <div className="flex items-center gap-4 mb-10">
              <div className="bg-gold/10 p-3 rounded-2xl text-gold border border-gold/20 shadow-lg">
                  <PieChartIcon className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Vortex Breakdown</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expense velocity by intent</p>
              </div>
              </div>

              <div className="h-[350px] w-full relative">
              {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                  <Pie
                      data={expensesByPurpose}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                  >
                      {expensesByPurpose.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '16px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      itemStyle={{ color: '#ffffff', fontWeight: '800', fontSize: '12px' }}
                      formatter={(val: unknown) => `Rp ${formatCurrency(Number(val))}`}
                  />
                  <Legend verticalAlign="bottom" height={42} iconType="circle" />
                  </PieChart>
              </ResponsiveContainer>
              ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-gold animate-spin" />
                  </div>
              )}
              </div>
          </section>
        </div>

        {/* Comparison Chart */}
        <div className="glass p-1 group">
          <section className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-gold/10 p-3 rounded-2xl text-gold border border-gold/20 shadow-lg">
                      <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Chronicle Flow</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active vs background performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Total</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gold shadow-gold" /> Active</div>
                </div>
              </div>

              <div className="h-[350px] w-full relative px-4">
              {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '16px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      itemStyle={{ fontWeight: '800', fontSize: '12px', color: '#fff' }}
                      formatter={(val: unknown, name: any) => [`Rp ${formatCurrency(Number(val))}`, name]}
                  />
                  {/* Global Background Totals */}
                  <Bar dataKey="totalIncome" name="Total Monthly Income" fill="#334155" radius={[6, 6, 0, 0]} barSize={24} fillOpacity={0.3} />
                  <Bar dataKey="totalExpense" name="Total Monthly Expense" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={24} fillOpacity={0.3} />
                  
                  {/* Active Filtered Data */}
                  <Bar dataKey="income" name="Active Income" fill="#34d399" radius={[6, 6, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" name="Active Expense" fill="#fb7185" radius={[6, 6, 0, 0]} barSize={12} />
                  </BarChart>
              </ResponsiveContainer>
              ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-gold animate-spin" />
                  </div>
              )}
              </div>
          </section>
        </div>

        {/* Comparison Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass bg-white/5 p-10 flex flex-col justify-center border-white/5 group hover:border-gold/20 transition-all">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4">Savings Velocity</span>
                <div className="flex items-end gap-3 text-5xl font-bold text-white tracking-tighter drop-shadow-xl">
                    {savingsRate}%
                    <span className="text-sm text-emerald-400 mb-2 font-black uppercase tracking-widest">Surplus</span>
                </div>
                <p className="text-[9px] text-gold/40 font-bold mt-4 uppercase tracking-[0.2em]">Efficiency of capital retention</p>
            </div>
            <div className="glass bg-white/5 p-10 flex flex-col justify-center border-white/5 group hover:border-gold/20 transition-all">
                <div className="flex items-center gap-3 text-emerald-400 mb-4">
                    <TrendingUp className="w-6 h-6 shadow-emerald-500/20" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Vitality Index</span>
                </div>
                <p className="text-white text-lg font-medium leading-relaxed italic drop-shadow-sm">
                    {totalIncome > totalExpense ? "Structure optimized. Wealth retention currently at peak efficiency." : "Outflow exceeds inflow. Strategic redistribution recommended."}
                </p>
            </div>
            <div className="glass bg-white/5 p-10 flex items-center justify-center border-white/5 group hover:bg-gold/5 hover:border-gold/30 transition-all cursor-pointer">
                <Link href="/analytics" className="text-gold font-black flex items-center gap-4 text-xs uppercase tracking-[0.3em]">
                    Global View <ArrowRightLeft className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
