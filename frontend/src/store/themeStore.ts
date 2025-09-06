import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      isDark: false,

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme, isDark: theme === 'dark' });
        
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        isDark: state.isDark,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on rehydration
          const root = document.documentElement;
          if (state.theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
    }
  )
);

// Selectors
export const useTheme = () => useThemeStore((state) => ({
  theme: state.theme,
  isDark: state.isDark,
}));

export const useThemeActions = () => useThemeStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}));
