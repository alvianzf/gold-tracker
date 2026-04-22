'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            "w-10 h-10 rounded-xl font-bold text-xs transition-all",
            currentPage === i
              ? "bg-gold text-black shadow-gold scale-110"
              : "bg-white/5 text-slate-400 border border-white/5 hover:border-gold/30 hover:text-white"
          )}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-white/5 text-slate-500 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gold/30 hover:text-white transition-all shadow-inner"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-white/5 text-slate-500 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gold/30 hover:text-white transition-all shadow-inner"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mx-2">
        {renderPageNumbers()}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-white/5 text-slate-500 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gold/30 hover:text-white transition-all shadow-inner"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-white/5 text-slate-500 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gold/30 hover:text-white transition-all shadow-inner"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
