'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, PieChart as PieChartIcon, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { FinanceTransaction } from './FinanceTable';

interface FinanceAnalyticsProps {
  transactions: FinanceTransaction[];
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

export default function FinanceAnalytics({ transactions }: FinanceAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);
  // Aggregate data for Pie Chart (Expense by Purpose)
  const expensesByPurpose = transactions
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

  // Aggregate data for Bar Chart (Income vs Expense over time/last 6 months or days)
  // For simplicity, let's group by date
  const comparisonData = transactions.reduce((acc: ComparisonItem[], tx) => {
    const date = new Date(tx.date).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      if (tx.type === 'CREDIT') existing.income += tx.amount;
      else existing.expense += tx.amount;
    } else {
      acc.push({ 
        date, 
        income: tx.type === 'CREDIT' ? tx.amount : 0, 
        expense: tx.type === 'DEBIT' ? tx.amount : 0 
      });
    }
    return acc;
  }, []).reverse().slice(-7); // Last 7 unique days of data

  const totalIncome = transactions.filter(tx => tx.type === 'CREDIT').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'DEBIT').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10" style={{ colorScheme: 'light' }}>
      {/* Purpose Breakdown */}
      <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-500">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Expense Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium">Spending distribution by purpose</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={expensesByPurpose}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expensesByPurpose.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                formatter={(val: unknown) => `Rp ${formatCurrency(Number(val))}`}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* Comparison Chart */}
      <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-500">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Income vs Expense</h3>
            <p className="text-xs text-slate-500 font-medium">Comparison across recent activity</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(val: unknown) => `Rp ${formatCurrency(Number(val))}`}
              />
              <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* Comparison Summary */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-center shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Savings Rate</span>
            <div className="flex items-end gap-2 text-2xl font-black text-slate-900">
                {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
                <span className="text-xs text-emerald-600 mb-1 font-bold">of income</span>
            </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Efficiency</span>
            </div>
            <p className="text-slate-600 text-sm font-medium italic">
                {totalIncome > totalExpense ? "You're growing your wealth! Keep it up." : "Your expenses are outpacing income. Let's look at the details."}
            </p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-center shadow-sm">
             <Link href="/analytics" className="text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-2">
                Detailed Analytics <TrendingUp className="w-4 h-4" />
             </Link>
        </div>
      </div>
    </div>
  );
}
