import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialTheme = (): Theme => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme as Theme;
    }
    return 'system';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = (currentTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);

    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  };

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (!storedTheme || storedTheme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);


  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
