'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

interface FinanceAnalyticsProps {
  transactions: any[];
}

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];

export default function FinanceAnalytics({ transactions }: FinanceAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Aggregate data for Pie Chart (Expense by Purpose)
  const expensesByPurpose = transactions
    .filter(tx => tx.type === 'DEBIT')
    .reduce((acc: any[], tx) => {
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
  const comparisonData = transactions.reduce((acc: any[], tx) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10" style={{ colorScheme: 'dark' }}>
      {/* Purpose Breakdown */}
      <section className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-500">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Expense Breakdown</h3>
            <p className="text-xs text-slate-500">Spending distribution by purpose</p>
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
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(val: number) => `Rp ${formatCurrency(val)}`}
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
      <section className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-500">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Income vs Expense</h3>
            <p className="text-xs text-slate-500">Comparison across recent activity</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(val: number) => `Rp ${formatCurrency(val)}`}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
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
        <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Savings Rate</span>
            <div className="flex items-end gap-2 text-2xl font-black text-white">
                {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
                <span className="text-xs text-emerald-500 mb-1 font-bold">of income</span>
            </div>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Efficiency</span>
            </div>
            <p className="text-slate-400 text-sm italic">
                {totalIncome > totalExpense ? "You're growing your wealth! Keep it up." : "Your expenses are outpacing income. Let's look at the details."}
            </p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
             <Link href="/analytics" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2">
                Detailed Analytics <TrendingUp className="w-4 h-4" />
             </Link>
        </div>
      </div>
    </div>
  );
}
