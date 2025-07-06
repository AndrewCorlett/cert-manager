'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark mode
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          // Disable transitions briefly for instant theme switch
          document.documentElement.setAttribute('data-theme-switching', 'true');
          document.documentElement.setAttribute('data-theme', newTheme);
          
          // Re-enable transitions after a frame
          requestAnimationFrame(() => {
            document.documentElement.removeAttribute('data-theme-switching');
          });
        }
      },
      
      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'cert-manager-theme', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load
        if (typeof window !== 'undefined' && state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);