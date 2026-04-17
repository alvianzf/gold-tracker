'use client';

import Link from 'next/link';
import { ArrowRight, Shield, BarChart3, Wallet, Coins, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: Coins,
      title: t('nav.gold'),
      description: t('hero.goldDesc'),
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      border: 'border-pencil',
    },
    {
      icon: Wallet,
      title: t('nav.finance'),
      description: t('hero.financeDesc'),
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      border: 'border-pencil',
    },
    {
      icon: Zap,
      title: t('nav.analytics'),
      description: t('hero.analyticsDesc'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      border: 'border-pencil',
    },
    {
      icon: Shield,
      title: t('hero.secureTitle'),
      description: t('hero.secureDesc'),
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      border: 'border-pencil',
    },
  ];

  const highlights = [
    t('hero.highlights.goldTracking'),
    t('hero.highlights.plVisual'),
    t('hero.highlights.aiInsights'),
    t('hero.highlights.userRole'),
    t('hero.highlights.receiptStore'),
    t('hero.highlights.auditTrail'),
  ];

  const mockTransactions = [
    { name: 'Salary Deposit', category: 'Income', amount: 15000000, type: 'plus' },
    { name: 'Grocery Run', category: 'Food & Drink', amount: 450000, type: 'minus' },
    { name: 'Antam 5g Purchase', category: 'Gold', amount: 5200000, type: 'minus' },
  ];

  return (
    <div className="flex flex-col gap-32 pb-32 overflow-hidden bg-transparent">
      {/* Hero Section */}
      <section className="relative pt-12 flex flex-col items-center text-center gap-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full shadow-2xl backdrop-blur-md"
        >
          <Coins className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/80">{t('hero.badge')}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-7xl md:text-9xl font-bold text-white tracking-tighter max-w-5xl leading-[0.85] drop-shadow-2xl"
        >
          {t('hero.title').split('Artistic Precision')[0]} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold animate-shimmer">Elite Tracking</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl leading-relaxed font-medium"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6 mt-4"
        >
          <Link
            href="/login"
            className="group relative flex items-center gap-3 bg-gold hover:bg-gold-strong text-black font-bold px-14 py-6 rounded-3xl shadow-gold transition-all hover:scale-105 active:scale-95"
          >
            {t('hero.getStarted')} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-14 py-6 rounded-3xl backdrop-blur-xl transition-all hover:scale-105"
          >
            {t('hero.signIn')}
          </Link>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {highlights.map((h) => (
            <span key={h} className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
              <CheckCircle className="w-4 h-4 text-gold" />
              {h}
            </span>
          ))}
        </motion.div>

        {/* High-Fidelity App Mockup — 1:1 Structural Replica */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 w-full max-w-6xl mx-auto px-4"
        >
          <div className="glass p-1.5 shadow-gold/20">
            <div className="glass bg-slate-950/80 p-8 md:p-12 flex flex-col gap-12 border-white/5 overflow-hidden">
               {/* 1:1 Dashboard Header Mockup */}
               <header className="glass-header p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 group">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 text-gold">
                      <div className="bg-gold/10 p-2 rounded-xl border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">{t('hero.mockup.activeLedger')}</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter text-white">VAULT<span className="text-gold">CORE</span></h2>
                    <p className="text-slate-400 max-w-md text-base font-bold uppercase tracking-widest opacity-60">{t('hero.mockup.systemVersion')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-10 py-5 bg-gold rounded-2xl text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-gold hover:scale-105 transition-transform">{t('hero.mockup.ingestAsset')}</div>
                  </div>
               </header>

               {/* 1:1 Daily Insight Mockup */}
               <div className="bg-gradient-to-r from-gold/20 to-transparent border border-gold/20 rounded-3xl p-10 flex items-center justify-between group cursor-pointer hover:bg-gold/25 transition-all shadow-inner">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-black shadow-gold animate-pulse relative">
                        <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-20" />
                        <Zap className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-2">{t('hero.mockup.dailyInsights')}</p>
                        <p className="text-xl font-bold text-white italic leading-tight tracking-tight">"Your gold reserves have increased by 4.2% this week. Total valuation up Rp 2.4M."</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
               </div>

               {/* 1:1 Visual Analytics Mockup */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
                  <div className="lg:col-span-2 glass bg-slate-900/60 p-10 border-white/5 h-[450px] flex flex-col shadow-inner">
                     <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-5">
                          <div className="bg-gold/10 p-4 rounded-2xl text-gold border border-gold/20">
                              <BarChart3 className="w-7 h-7" />
                          </div>
                           <div>
                               <h4 className="text-xl font-black text-white tracking-tight uppercase">{t('hero.mockup.performanceMetrics')}</h4>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t('hero.mockup.temporalValuation')}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 flex items-end justify-between gap-5 px-4 pb-4">
                        {[40, 75, 45, 95, 65, 85, 55, 90, 70, 80].map((h, i) => (
                           <div key={i} className="flex-1 flex flex-col gap-3 group cursor-pointer h-full justify-end">
                              <div className="w-full bg-white/[0.03] rounded-t-xl relative overflow-hidden h-full">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ duration: 1, delay: 0.8 + (i * 0.05) }}
                                  className="absolute bottom-0 left-0 right-0 bg-gold/40 border-t border-gold group-hover:bg-gold/60 transition-all shadow-gold/20"
                                />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="glass bg-slate-900/60 p-10 border-white/5 group hover:border-gold/40 transition-all shadow-inner">
                       <div className="flex items-center gap-5 mb-8">
                         <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/10 group-hover:bg-gold group-hover:text-black transition-all">
                           <Wallet className="w-7 h-7" />
                         </div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('finance.totalBalance')}</span>
                       </div>
                       <div className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">Rp 42.1M</div>
                    </div>
                    <div className="glass bg-gold/5 p-10 border-gold/20 group hover:bg-gold/10 transition-all shadow-inner">
                       <div className="flex items-center gap-5 mb-8">
                         <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-black shadow-gold">
                           <TrendingUp className="w-7 h-7" />
                         </div>
                         <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">{t('finance.income')}</span>
                       </div>
                       <div className="text-5xl font-black text-white tracking-tighter">+ Rp 15M</div>
                    </div>
                  </div>
               </div>

               {/* 1:1 Transaction Table Mockup */}
                <div className="glass bg-slate-900/40 border-white/5 overflow-hidden shadow-2xl">
                   <div className="px-10 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">{t('hero.mockup.registry')}</h4>
                      <Link href="/finance" className="text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3 hover:translate-x-2 transition-transform">{t('hero.mockup.accessLedgers')} <ArrowRight className="w-5 h-5" /></Link>
                   </div>
                  <div className="divide-y divide-white/5">
                      {[
                        { name: t('hero.mockup.corporateRetainer'), cat: t('hero.mockup.liquidityInbound'), val: '15,000,000', type: 'plus', bg: 'bg-emerald-500/10', color: 'text-emerald-400', icon: TrendingUp },
                        { name: t('hero.mockup.antamBullion'), cat: t('hero.mockup.assetAcquisition'), val: '5,200,000', type: 'minus', bg: 'bg-gold/10', color: 'text-gold', icon: Coins },
                        { name: t('hero.mockup.cloudTerminal'), cat: t('hero.mockup.operationalCost'), val: '150,000', type: 'minus', bg: 'bg-white/5', color: 'text-slate-400', icon: Shield }
                      ].map((tx, i) => (
                       <div key={i} className="flex items-center justify-between p-10 hover:bg-white/[0.04] transition-all group cursor-default">
                          <div className="flex items-center gap-8">
                             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 ${tx.bg} ${tx.color} group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                                <tx.icon className="w-8 h-8" />
                             </div>
                             <div className="text-left">
                                <p className="text-2xl font-black text-white leading-none mb-3 tracking-tight">{tx.name}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{tx.cat}</p>
                             </div>
                          </div>
                          <div className={`text-3xl font-black tracking-tighter ${tx.type === 'plus' ? 'text-emerald-400' : 'text-white'} group-hover:scale-110 transition-transform origin-right`}>
                             {tx.type === 'plus' ? '+' : '-'} Rp {tx.val}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 w-full text-center">
        <div className="mb-24 space-y-6">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
            {t('hero.featureTitle').split('Peak')[0]} <span className="text-gold">Peak</span> Performance
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">{t('hero.featureSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-10 hover:border-gold/30 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-3xl bg-gold/10 flex items-center justify-center mb-10 border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                  <Icon className="w-8 h-8 text-gold group-hover:text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight text-left">{feature.title}</h3>
                <p className="text-slate-400 text-base font-medium leading-relaxed text-left">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 w-full h-[600px]">
        <div className="glass h-full p-20 flex flex-col items-center justify-center text-center gap-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold opacity-[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter relative z-10 leading-[0.9]">
            {t('hero.readyTitle')}
          </h2>
          <p className="text-slate-400 max-w-2xl text-xl font-medium relative z-10">
            {t('hero.readySubtitle')}
          </p>
          <Link
            href="/register"
            className="flex items-center gap-4 bg-gold hover:bg-gold-strong text-black font-bold px-16 py-8 rounded-3xl shadow-gold transition-all hover:scale-105 active:scale-95 relative z-10"
          >
            {t('hero.createAccount')} <ArrowRight className="w-7 h-7" />
          </Link>
        </div>
      </section>
    </div>
  );
}
