'use client';

import { useEffect } from 'react';

export default function ThemeEnforcer() {
  useEffect(() => {
    // Enforce dark mode and dark background at the root level
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#020617';
    document.body.style.color = '#f8fafc';
    
    // Add a small delay to ensure it sticks after Next.js hydration
    const timer = setTimeout(() => {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
