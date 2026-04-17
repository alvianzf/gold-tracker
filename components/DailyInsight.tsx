'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, Quote } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl animate-pulse flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      <div className="h-4 w-48 bg-white/5 rounded-full" />
    </div>
  );

  if (isError || !insight) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl group"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Quote className="w-4 h-4 text-amber-500/40" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">AI Gold Advisor</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={insight.content}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-lg md:text-2xl font-bold text-white leading-relaxed italic drop-shadow-sm"
            >
              "{insight.content}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={handleRegenerate}
            disabled={insight.regenerated || isRegenerating}
            className={`group relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
              insight.regenerated 
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-transparent' 
                : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 shadow-lg'
            }`}
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${!insight.regenerated && 'group-hover:rotate-180 transition-transform duration-500'}`} />
            )}
            <span className="text-sm">
              {insight.regenerated ? 'Limit Reached' : 'Regenerate'}
            </span>
            {!insight.regenerated && !isRegenerating && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] items-center justify-center text-slate-950 font-black">1</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
