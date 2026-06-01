'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  RefreshCw, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/LanguageContext';

interface AnalysisItem {
  id?: string;
  vendor: 'ANTAM' | 'UBS' | 'GALERI24';
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasons: string[];
  details: string;
  date: string;
}

export default function GoldAIAdvisory() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const { data: analyses, isLoading, isError } = useQuery<AnalysisItem[]>({
    queryKey: ['gold-analysis'],
    queryFn: async () => {
      const { data } = await axios.get('/api/gold/analysis');
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await axios.post('/api/gold/analysis');
      await queryClient.invalidateQueries({ queryKey: ['gold-analysis'] });
    } catch (error) {
      console.error('Failed to manually sync gold AI analysis:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleExpand = (vendor: string) => {
    if (expandedVendor === vendor) {
      setExpandedVendor(null);
    } else {
      setExpandedVendor(vendor);
    }
  };

  if (isLoading) {
    return (
      <div className="glass bg-white/5 border-white/5 p-12 flex flex-col items-center justify-center gap-6 min-h-[300px] animate-pulse">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
          <div className="absolute inset-0 bg-gold/20 rounded-full blur-[10px] animate-ping" />
        </div>
        <div className="space-y-3 flex flex-col items-center">
          <div className="h-5 w-48 bg-white/10 rounded-full" />
          <div className="h-4 w-72 bg-white/5 rounded-full" />
        </div>
      </div>
    );
  }

  if (isError || !analyses || analyses.length === 0) {
    return null; // Gracefully hide if error occurs or no analysis is available
  }

  const lastUpdated = analyses[0]?.date 
    ? new Date(analyses[0].date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    : '09:10 WIB';

  // Vendor display name mapping
  const vendorNames = {
    ANTAM: 'Antam Bullion 24K',
    UBS: 'UBS Gold Indonesia',
    GALERI24: 'Galeri 24 Signature'
  };

  // Color schemes based on recommendation
  const config = {
    BUY: {
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40 border-white/5',
      icon: TrendingUp,
      accent: 'bg-emerald-500',
      glowShadow: 'shadow-emerald-500/10',
    },
    SELL: {
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glow: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'hover:border-rose-500/40 border-white/5',
      icon: TrendingDown,
      accent: 'bg-rose-500',
      glowShadow: 'shadow-rose-500/10',
    },
    HOLD: {
      color: 'text-slate-300',
      badgeBg: 'bg-slate-400/10 border-slate-400/20 text-slate-300',
      glow: 'from-slate-400/10 via-slate-400/5 to-transparent',
      borderColor: 'hover:border-slate-400/40 border-white/5',
      icon: MinusCircle,
      accent: 'bg-slate-400',
      glowShadow: 'shadow-slate-400/10',
    }
  };

  return (
    <div className="relative overflow-hidden glass p-1 shadow-gold/5 group">
      {/* Absolute Decorative Glow Ring */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold opacity-[0.03] rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      
      <div className="glass bg-slate-900/60 p-8 md:p-10 border-white/5">
        
        {/* Header section with Title and Sync Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-gold">
              <div className="bg-gold/10 p-2.5 rounded-xl border border-gold/20 shadow-md">
                <Sparkles className="w-5 h-5 text-gold animate-shimmer" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">AI Market Intelligence</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Daily Bullion Strategy
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Automated price movement modeling & trading advisory. Generated daily at <span className="text-gold font-bold">9:10 AM WIB</span>.
            </p>
          </div>

          <div className="flex items-center gap-5 self-start md:self-center">
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Last Synced</p>
              <p className="text-xs font-semibold text-slate-300">{lastUpdated}</p>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "group relative flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border shadow-lg cursor-pointer",
                isSyncing 
                  ? "bg-white/5 text-slate-500 border-white/10" 
                  : "bg-gold hover:bg-gold-strong text-black border-gold shadow-gold/20 hover:scale-105 active:scale-95"
              )}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className={cn("w-4 h-4", !isSyncing && "group-hover:rotate-180 transition-transform duration-700")} />
              )}
              <span>{isSyncing ? 'Analyzing...' : 'Sync Advice'}</span>
            </button>
          </div>
        </div>

        {/* Core Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {analyses.map((item) => {
            const cfg = config[item.recommendation] || config.HOLD;
            const Icon = cfg.icon;
            const isExpanded = expandedVendor === item.vendor;

            return (
              <motion.div
                key={item.vendor}
                layout
                className={cn(
                  "relative overflow-hidden glass p-0.5 transition-all duration-300 shadow-md group/card cursor-pointer",
                  cfg.borderColor
                )}
                onClick={() => toggleExpand(item.vendor)}
              >
                {/* Harmonic HSL Gradient Backdrop Glow */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-[0.04] group-hover/card:opacity-[0.08] transition-opacity pointer-events-none",
                  cfg.glow
                )} />

                <div className="glass bg-slate-950/40 p-6 md:p-8 flex flex-col h-full justify-between">
                  
                  {/* Top Bar: Vendor Name & Glow Recommendation Badge */}
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {vendorNames[item.vendor] || item.vendor}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                        cfg.badgeBg
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", cfg.accent)} />
                        {item.recommendation}
                      </div>
                    </div>

                    {/* Headline Price Rationale block */}
                    <div className="flex items-start gap-4 pt-2">
                      <div className={cn("p-2 rounded-xl bg-white/[0.02] border border-white/5 text-left shrink-0", cfg.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-white leading-tight">
                          {item.recommendation === 'BUY' && 'Accumulation Phase'}
                          {item.recommendation === 'SELL' && 'Profit Liquidation'}
                          {item.recommendation === 'HOLD' && 'Sideways Consolidation'}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          Based on local spread & technical markers.
                        </p>
                      </div>
                    </div>

                    {/* Reasons list (bulleted items) */}
                    <ul className="space-y-3.5 pt-6 border-t border-white/5">
                      {item.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-left">
                          <CheckCircle2 className={cn("w-4 h-4 shrink-0 mt-0.5", cfg.color)} />
                          <span className="text-xs font-medium text-slate-300 leading-relaxed">
                            {reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expand / Technical Details Trigger bar */}
                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-slate-400 group-hover/card:text-white transition-colors">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gold/80" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {isExpanded ? 'Hide Technical' : 'View Analysis'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gold" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>

                  {/* Detailed Analysis (Framer Motion Drawer) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 text-left border-t border-white/5 mt-4">
                          <p className="text-xs font-semibold text-gold/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>•</span> Strategic Breakdown
                          </p>
                          <p className="text-xs font-medium text-slate-400 leading-relaxed whitespace-pre-line bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            {item.details}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
