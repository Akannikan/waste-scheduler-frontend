import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import { getMyProfile } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('user-preferences-changed'));
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await apiLogin({ email, password });
      saveSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await apiRegister(formData);
      saveSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      window.dispatchEvent(new Event('user-preferences-changed'));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMyProfile();
      const freshUser = data.user;
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return user;
    }
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';
  const isResident = user?.role === 'resident';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser, isAdmin, isCollector, isResident }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
