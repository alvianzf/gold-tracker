'use client';

import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ className, size = 'md' }: LoaderProps) {
  const sizes = {
    sm: 'h-4 w-4 gap-0.5',
    md: 'h-8 w-8 gap-1',
    lg: 'h-16 w-16 gap-2',
  };

  const barSizes = {
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-2',
  };

  return (
    <div className={cn("flex items-end justify-center", sizes[size], className)}>
      <div className={cn("bg-gold animate-loading-bar-1 rounded-full", barSizes[size])} style={{ height: '40%' }} />
      <div className={cn("bg-gold animate-loading-bar-2 rounded-full", barSizes[size])} style={{ height: '70%' }} />
      <div className={cn("bg-gold animate-loading-bar-3 rounded-full", barSizes[size])} style={{ height: '100%' }} />
      <div className={cn("bg-gold animate-loading-bar-2 rounded-full", barSizes[size])} style={{ height: '60%' }} />
      <div className={cn("bg-gold animate-loading-bar-1 rounded-full", barSizes[size])} style={{ height: '30%' }} />
    </div>
  );
}
