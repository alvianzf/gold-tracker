'use client';

import { useI18n } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 py-2 group whitespace-nowrap"
      title={locale === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}
    >
      <span className="text-base">
        {locale === 'en' ? '🇬🇧' : '🇮🇩'}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
        {locale === 'en' ? 'English' : 'Indonesia'}
      </span>
    </button>
  );
}
