'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount and theme changes
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}