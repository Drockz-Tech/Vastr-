import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { darkColors, lightColors, ThemeColors } from '../theme/tokens';

type ThemeMode = 'light' | 'dark';
type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'vastre-theme-mode';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (mounted && (saved === 'light' || saved === 'dark')) setMode(saved);
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const toggleTheme = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    isDark: mode === 'dark',
    toggleTheme,
  }), [mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used within ThemeProvider');
  return value;
}
