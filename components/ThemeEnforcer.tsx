'use client';

import { useEffect } from 'react';

export default function ThemeEnforcer() {
  useEffect(() => {
    // Enforce light pastel theme at the root level
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
    
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
