import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'Inter');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 16);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--font-base', `'${fontFamily}', sans-serif`);
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('fontSize', String(fontSize));
  }, [theme, fontFamily, fontSize]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const setPreferences = ({ nextTheme, nextFontFamily, nextFontSize }) => {
    if (nextTheme) setTheme(nextTheme);
    if (nextFontFamily) setFontFamily(nextFontFamily);
    if (nextFontSize) setFontSize(Number(nextFontSize));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', fontFamily, fontSize, setPreferences }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
