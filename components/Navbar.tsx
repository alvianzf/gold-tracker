'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, BarChart3, Coins, Users, LogOut, Menu, X, Wallet, UserCircle, Settings } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { useI18n } from '@/context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useI18n();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await axios.get('/api/auth/me');
      return data;
    },
    retry: false,
  });
  
  if (pathname === '/login') return null;

  const navItems = [
    { name: t('nav.gold'), href: '/gold', icon: Coins },
    { name: t('nav.finance'), href: '/finance', icon: Wallet },
    { name: t('nav.analytics'), href: '/analytics', icon: BarChart3 },
    { name: t('nav.history'), href: '/history', icon: History },
  ];

  const filteredNavItems = navItems; // User Management moved to dropdown

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass px-6 h-20 flex items-center justify-between shadow-gold">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 overflow-hidden flex items-center justify-center bg-white rounded-full border border-gold-strong/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tighter leading-tight">
              Gold <span className="text-gold">Tracker</span>
            </span>
            <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest leading-none">Portfolio Elite</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-1">
          {user && (
            <>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 text-sm font-semibold tracking-tight",
                      isActive 
                        ? "bg-gold text-black shadow-gold scale-105" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="w-px h-6 bg-white/10 mx-4" />
            </>
          )}

          {user && (
            <div 
              className="relative"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all duration-300 text-sm font-semibold tracking-tight",
                  pathname === '/profile'
                    ? "bg-gold text-black shadow-gold scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                  <UserCircle className="w-5 h-5 text-gold" />
                </div>
                {user.username}
              </Link>

              {/* Desktop User Dropdown on Hover */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full pt-4 z-50"
                  >
                    <div className="keep-bg w-60 p-2 space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <UserCircle className="w-4 h-4 text-gold" />
                          {t('nav.profile') || 'My Profile'}
                        </Link>
                        
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/users"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            {t('nav.users') || 'Admin Access'}
                          </Link>
                        )}
                        
                        <div className="px-4 py-2 border-t border-white/5 mt-2">
                          <LanguageToggle />
                        </div>

                        <div className="h-px bg-white/5 mx-2 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {!user && (
            <Link href="/login" className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold bg-gold hover:bg-gold-strong text-black shadow-gold transition-all hover:scale-105 active:scale-95">
              {t('hero.signIn')}
            </Link>
          )}
        </div>

        {/* Burger Menu Button */}
        <div className="flex xl:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="xl:hidden mt-4"
          >
            <div className="glass p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Navigation</span>
                <LanguageToggle />
              </div>

              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-base font-semibold",
                      isActive 
                        ? "bg-gold text-black shadow-gold" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              {user && (
                <>
                  <div className="h-px bg-white/5 my-4" />
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-base font-semibold",
                      pathname === '/profile' ? "bg-gold text-black shadow-gold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <UserCircle className="w-5 h-5" />
                    {t('nav.profile')}
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/users"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gold"
                    >
                      <Users className="w-5 h-5" />
                      {t('nav.users')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('nav.logout')}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
