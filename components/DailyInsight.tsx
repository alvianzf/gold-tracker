'use client';

import { useState } from 'react';
import { Zap, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const formatInsightText = (text: string) => {
  if (!text) return null;
  // Match **bold** or *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-gold border-b border-gold/30">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="not-italic text-gold/90">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function DailyInsight() {
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data: insight, isLoading, isError } = useQuery<any>({
    queryKey: ['daily-suggestion'],
    queryFn: async () => {
      const { data } = await axios.get('/api/finance/suggestion');
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleRegenerate = async () => {
    if (insight?.regenerated || isRegenerating) return;

    setIsRegenerating(true);
    try {
      await axios.post('/api/finance/suggestion');
      await queryClient.invalidateQueries({ queryKey: ['daily-suggestion'] });
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) return (
    <div className="glass bg-white/5 border-white/10 p-12 animate-pulse flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 text-gold animate-spin" />
      <div className="h-4 w-64 bg-white/10 rounded-full" />
    </div>
  );

  if (isError || !insight) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden glass p-1 shadow-gold/10 group cursor-pointer"
    >
      <div className="glass bg-gradient-to-r from-gold/15 via-transparent to-transparent p-10 flex flex-col md:flex-row items-center gap-10 border-white/5 group-hover:bg-gold/10 transition-all duration-700">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-[0.05] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shadow-gold animate-shimmer relative z-10">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <div className="absolute inset-0 bg-gold/50 rounded-full animate-ping opacity-20" />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="p-1.5 rounded-lg bg-gold/10 border border-gold/20">
              <Zap className="w-4 h-4 text-gold fill-gold/20" />
            </div>
            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">Daily Insights</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={insight.content}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-bold text-white leading-tight italic tracking-tight whitespace-pre-line"
            >
              {formatInsightText(insight.content)}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 relative z-10">
          <button
            onClick={handleRegenerate}
            disabled={insight.regenerated || isRegenerating}
            className={cn(
              "group relative flex items-center gap-4 px-8 py-4 rounded-2xl font-bold transition-all border shadow-lg",
              insight.regenerated 
                ? "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed opacity-50" 
                : "bg-gold hover:bg-gold-strong text-black border-gold shadow-gold hover:scale-105 active:scale-95"
            )}
          >
            {isRegenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className={cn("w-5 h-5", !insight.regenerated && "group-hover:rotate-180 transition-transform duration-700")} />
            )}
            <span className="text-sm uppercase tracking-widest font-black">
              {insight.regenerated ? 'LIMIT' : 'SYNC'}
            </span>
            {!insight.regenerated && !isRegenerating && (
              <div className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black border border-gold text-[10px] font-black text-gold shadow-gold animate-bounce">
                1
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
