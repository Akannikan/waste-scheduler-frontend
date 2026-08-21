import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const DISPLAY_PREFS_KEY = 'wasteScheduler.displayPrefs';
const DEFAULT_PREFERENCES = { theme: 'light', fontFamily: 'Inter', fontSize: 16 };

function safeReadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(DISPLAY_PREFS_KEY) || '{}');
    return { ...DEFAULT_PREFERENCES, ...stored };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

function persistPreferences(preferences) {
  try {
    localStorage.setItem(DISPLAY_PREFS_KEY, JSON.stringify(preferences));
  } catch {
    // storage may be unavailable in private browsing or constrained mode
  }
}

export function ThemeProvider({ children }) {
  const [preferences, setPreferencesState] = useState(() => safeReadPreferences());

  const applyPreferences = (nextPreferences) => {
    const merged = { ...DEFAULT_PREFERENCES, ...safeReadPreferences(), ...nextPreferences };
    persistPreferences(merged);

    document.documentElement.setAttribute('data-theme', merged.theme);
    document.documentElement.style.setProperty('--font-base', `'${merged.fontFamily}', sans-serif`);
    document.documentElement.style.setProperty('--font-heading', `'${merged.fontFamily}', sans-serif`);
    document.documentElement.style.setProperty('--font-size-base', `${merged.fontSize}px`);
    document.documentElement.style.setProperty('--user-font-family', merged.fontFamily);
    document.documentElement.style.setProperty('--user-font-size', `${merged.fontSize}px`);
  };

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const syncFromUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const nextPreferences = { ...safeReadPreferences() };
        if (storedUser?.theme) nextPreferences.theme = storedUser.theme;
        if (storedUser?.fontFamily) nextPreferences.fontFamily = storedUser.fontFamily;
        if (storedUser?.fontSize) nextPreferences.fontSize = Number(storedUser.fontSize);

        setPreferencesState((prev) => (
          prev.theme === nextPreferences.theme &&
          prev.fontFamily === nextPreferences.fontFamily &&
          prev.fontSize === nextPreferences.fontSize
            ? prev
            : nextPreferences
        ));
      } catch {
        // ignore malformed data
      }
    };

    syncFromUser();
    window.addEventListener('user-preferences-changed', syncFromUser);
    return () => window.removeEventListener('user-preferences-changed', syncFromUser);
  }, []);

  const setPreferences = (updates = {}) => {
    setPreferencesState((prev) => {
      const next = {
        ...DEFAULT_PREFERENCES,
        ...safeReadPreferences(),
        ...prev,
        ...updates,
      };
      persistPreferences(next);
      return next;
    });
  };

  const toggleTheme = () => {
    setPreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.theme,
        fontFamily: preferences.fontFamily,
        fontSize: preferences.fontSize,
        isDark: preferences.theme === 'dark',
        toggleTheme,
        setPreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
