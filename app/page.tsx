'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Shield, BarChart3, Wallet, Coins, Smartphone, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  const features = [
    {
      icon: Coins,
      title: 'Gold Portfolio',
      description: 'Track Antam, UBS, and Galeri 24 holdings with real-time spot prices and P/L analytics.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Wallet,
      title: 'Finance Tracker',
      description: 'Monitor expenses and income with category-wise breakdown and receipt uploads.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'Get daily financial advice and spending analysis powered by SumoPod AI.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected with industry-standard security.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 flex flex-col items-center text-center gap-8">
        {/* Glow Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">New: AI Financial Advisor</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black text-slate-100 tracking-tighter max-w-5xl leading-[1.1]"
        >
          Master Your Wealth with <span className="bg-gradient-to-tr from-amber-400 via-amber-200 to-white bg-clip-text text-transparent drop-shadow-sm">Precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-300 max-w-3xl leading-relaxed font-medium"
        >
          The all-in-one platform to track gold investments, manage personal finances, and get AI-driven insights to grow your net worth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6 mt-8"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-10 py-5 rounded-[24px] font-black transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95"
          >
            Get Started Now <ArrowRight className="w-6 h-6" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100 px-10 py-5 rounded-[24px] font-bold transition-all backdrop-blur-md hover:scale-105 active:scale-95"
          >
            Live Demo
          </Link>
        </motion.div>

        {/* Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-6xl mx-auto px-4"
        >
          <div className="relative aspect-[16/9] rounded-[40px] border border-white/10 bg-slate-900 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 z-10" />
            <div className="flex h-full p-4 md:p-8 gap-4 overflow-hidden opacity-40">
              {/* Fake UI Elements */}
              <div className="w-64 h-full bg-slate-950 border border-white/5 rounded-3xl p-6 hidden md:block">
                 <div className="w-32 h-4 bg-white/10 rounded-full mb-8" />
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-full h-10 bg-white/5 rounded-xl mb-3" />
                 ))}
              </div>
              <div className="flex-1 flex flex-col gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-slate-950 border border-white/5 rounded-3xl" />
                    ))}
                 </div>
                 <div className="flex-1 bg-slate-950 border border-white/5 rounded-3xl p-8">
                    <div className="w-48 h-6 bg-white/10 rounded-full mb-8" />
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-full h-12 bg-white/5 rounded-2xl" />
                      ))}
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Real Screenshot Link overlay or text */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl scale-75 md:scale-100">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-slate-950" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Intuitive Dashboard</p>
                    <p className="text-slate-400 text-sm">Visualize your growth seamlessly.</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white">Built for <span className="text-amber-500">Growth</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to manage your assets in one place, optimized for performance and ease of use.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-900/50 border border-white/5 p-8 rounded-[32px] hover:bg-slate-800/50 hover:border-white/10 transition-all group"
              >
                <div className={`${feature.bg} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 w-full h-[400px]">
        <div className="relative h-full w-full rounded-[40px] bg-gradient-to-br from-indigo-600 to-indigo-900 overflow-hidden flex flex-col items-center justify-center text-center px-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to secure your future?</h2>
          <p className="text-indigo-100 mb-10 text-lg md:text-xl max-w-xl relative z-10">Join thousands of users tracking their wealth with precision every single day.</p>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-white text-indigo-900 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl relative z-10"
          >
            Create Your Account <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Small Quote Footer */}
      <section className="text-center px-4">
        <p className="text-slate-500 font-medium italic">"Precision is the foundation of wealth management."</p>
      </section>
    </div>
  );
}
