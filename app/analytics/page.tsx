'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import TrendChart from '@/components/TrendChart';
import { BarChart3, TrendingUp, History, Wallet, PieChart as PieChartIcon, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { useI18n } from '@/context/LanguageContext';

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [selectedType, setSelectedType] = useState('ANTAM');
  const { t } = useI18n();

  const { data: netWorthHistory } = useQuery({
    queryKey: ['net-worth-history', range],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/net-worth-history?range=${range}`);
      return data;
    },
  });

  const { data: priceHistory } = useQuery({
    queryKey: ['price-history', selectedType, range],
    queryFn: async () => {
      const { data } = await axios.get(`/api/prices/history?type=${selectedType}&range=${range}`);
      return data;
    },
  });

  const { data: portfolioHistory } = useQuery({
    queryKey: ['portfolio-history', range],
    queryFn: async () => {
      const { data } = await axios.get(`/api/portfolio/history?range=${range}`);
      return data;
    },
  });

  const { data: financeTransactions } = useQuery({
    queryKey: ['finance-transactions'],
    queryFn: async () => {
      const { data } = await axios.get('/api/finance');
      return data;
    },
  });

  // Calculate current holdings and balance
  const currentGoldValue = portfolioHistory?.length 
    ? portfolioHistory[portfolioHistory.length - 1].totalValue 
    : 0;
    
  const financeBalance = useMemo(() => {
    if (!financeTransactions) return 0;
    return financeTransactions.reduce((acc: number, tx: any) => 
      tx.type === 'CREDIT' ? acc + tx.amount : acc - tx.amount, 0
    );
  }, [financeTransactions]);

  const totalWealth = currentGoldValue + financeBalance;
  
  const wealthComposition = [
    { name: t('analytics.allocation_gold') || 'Physical Gold', value: currentGoldValue, color: '#fbbf24' },
    { name: t('analytics.allocation_cash') || 'Liquid Cash', value: financeBalance, color: '#818cf8' },
  ].filter(item => item.value > 0);

  const latestProfit = portfolioHistory?.length 
    ? portfolioHistory[portfolioHistory.length - 1].totalProfit 
    : 0;
  const isPositive = latestProfit >= 0;
  const plColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in duration-1000">
      {/* Header */}
      <header className="glass p-1 md:p-1.5 shadow-gold/5">
        <div className="glass bg-slate-900/60 p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 border-white/5">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 text-gold">
              <div className="bg-gold/10 p-3 rounded-2xl border border-gold/20 shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{t('analytics.intelligence') || 'Wealth Intelligence'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
              {t('analytics.title')}
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              {t('analytics.subtitle') || 'Consolidating your gold assets and financial liquidity into a singular wealth trajectory.'}
            </p>
          </div>
        </div>
      </header>

      {/* Sticky Range Selector */}
      <div className="sticky top-28 z-30 py-4 animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none">
        <div className="flex bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl shadow-2xl backdrop-blur-2xl max-w-fit mx-auto shadow-gold/5 pointer-events-auto">
          {['7d', '30d', '90d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                range === r 
                  ? "bg-gold text-black shadow-gold scale-105" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Total Wealth Summary Card */}
      <section className="glass p-1 group">
        <div className="glass bg-gradient-to-r from-gold/20 via-slate-900/40 to-slate-900/40 p-12 flex flex-col md:flex-row items-center justify-between gap-10 border-white/5 group-hover:bg-gold/5 transition-all duration-700">
          <div className="flex items-center gap-8">
            <div className="bg-gold p-5 rounded-3xl text-black shadow-gold animate-shimmer">
              <Wallet className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-3">{t('analytics.netWorth')}</h2>
              <p className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                Rp {formatCurrency(totalWealth)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-6 w-full md:w-auto">
              <div className="flex-1 glass bg-white/5 p-8 border-white/10 shadow-inner min-w-[200px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('analytics.reserve') || 'Gold Reserve'}</p>
                  <p className="text-2xl font-black text-white tracking-tight">Rp {formatCurrency(currentGoldValue)}</p>
              </div>
              <div className="flex-1 glass bg-white/5 p-8 border-white/10 shadow-inner min-w-[200px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('analytics.liquid') || 'Liquid Cash'}</p>
                  <p className="text-2xl font-black text-white tracking-tight">Rp {formatCurrency(financeBalance)}</p>
              </div>
          </div>
        </div>
      </section>

      {/* Absolute Net Worth Trend Chart */}
      <section className="glass p-1 group">
        <div className="glass bg-slate-900/40 p-10 border-white/5 group-hover:border-gold/20 transition-all">
          <div className="flex items-center gap-5 mb-12">
            <div className="bg-gold/10 p-3 rounded-2xl text-gold border border-gold/20 shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t('analytics.netWorth')} Progress</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Cash + Gold Historical Performance</p>
            </div>
          </div>
          <div className="px-4">
            <TrendChart 
              data={netWorthHistory || []} 
              dataKey="totalNetWorth" 
              color="#fbbf24" 
              label={t('analytics.netWorth')} 
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Wealth Composition Chart */}
        <section className="glass p-1 group">
          <div className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
            <div className="flex items-center gap-5 mb-10">
              <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{t('analytics.allocation')}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">{t('analytics.composition')}</p>
              </div>
            </div>
            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wealthComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {wealthComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(val: any) => `Rp ${formatCurrency(val)}`}
                     contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '16px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                     itemStyle={{ color: '#ffffff', fontWeight: '800', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={42} wrapperStyle={{ fontWeight: '800', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Portfolio Value Trend */}
        <section className="glass p-1 group">
          <div className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
            <div className="flex items-center gap-5 mb-10">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Equity Growth</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Gold Performance</p>
              </div>
            </div>
            <div className="px-4">
              <TrendChart 
                data={portfolioHistory || []} 
                dataKey="totalValue" 
                color="#34d399" 
                label="Total Value" 
              />
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Price Trends */}
        <section className="glass p-1 group">
          <div className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="bg-gold/10 p-3 rounded-2xl text-gold border border-gold/20 shadow-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Market Spot</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Per Gram Value</p>
                </div>
              </div>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-6 py-3 text-xs font-black text-gold outline-none focus:border-gold/40 transition-all cursor-pointer [color-scheme:dark] shadow-xl"
              >
                <option value="ANTAM">ANTAM</option>
                <option value="UBS">UBS</option>
                <option value="GALERI24">GALERI 24</option>
              </select>
            </div>
            <div className="px-4">
              <TrendChart 
                data={priceHistory || []} 
                dataKey="priceBuy" 
                color="#fbbf24" 
                label="Buy Price" 
              />
            </div>
          </div>
        </section>

        {/* P/L History */}
        <section className="glass p-1 group">
          <div className="glass bg-slate-900/40 p-10 h-full border-white/5 group-hover:border-gold/20 transition-all">
            <div className="flex items-center gap-5 mb-10">
              <div className={cn(
                "p-3 rounded-2xl border shadow-lg",
                isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              )}>
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Vortex Trajectory</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Growth Index Over Time</p>
              </div>
            </div>
            <div className="px-4">
              <TrendChart 
                data={portfolioHistory || []} 
                dataKey="totalProfit" 
                color={plColor} 
                label="Net Profit" 
                type="line"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
