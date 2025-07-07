'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount and theme changes
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update PWA theme color to match current theme
    const themeColorMeta = document.getElementById('theme-color') as HTMLMetaElement;
    if (themeColorMeta) {
      const newThemeColor = theme === 'light' ? '#E2E8F0' : '#121212'; // var(--grey-700) for each theme
      themeColorMeta.content = newThemeColor;
    }
  }, [theme]);

  return <>{children}</>;
}