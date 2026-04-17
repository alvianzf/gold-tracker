'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from './Portal';

interface Action {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  actions: Action[];
}

export default function ActionMenu({ actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position below the button, aligned to the right (default)
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 224, // 224px is w-56
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-gold/10 text-slate-500 hover:text-gold transition-all border border-white/10 hover:border-gold/30"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.1 }}
              style={{
                top: coords.top + 12,
                left: coords.left,
                position: 'absolute',
              }}
              className="w-56 glass p-1.5 shadow-2xl z-[1001] overflow-hidden"
            >
              <div className="glass bg-slate-900 border-white/5 py-3">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group",
                        action.variant === 'danger' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <div className={cn(
                        "transition-transform group-hover:scale-110",
                        action.variant === 'danger' ? 'text-rose-500' : 'text-gold'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
