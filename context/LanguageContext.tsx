'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Detect system language
    const savedLocale = localStorage.getItem('user-locale') as Locale;
    if (savedLocale) {
      setLocaleState(savedLocale);
    } else {
      const systemLang = navigator.language.split('-')[0];
      if (systemLang === 'id') {
        setLocaleState('id');
      } else {
        setLocaleState('en');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('user-locale', newLocale);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let result = dictionaries[locale] as any;
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
