'use client';

import { useEffect } from 'react';

export default function ThemeEnforcer() {
  useEffect(() => {
    // Enforce elite Dark Gold Glass theme at the root level
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    
    // Continuous enforcement to prevent third-party theme injection
    const timer = setTimeout(() => {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
