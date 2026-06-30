import { useState, useEffect, useCallback } from 'react';
import { apiLogin, apiRegister, clearToken } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('inv_user');
    const token = localStorage.getItem('inv_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { clearToken(); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await apiLogin(username, password);
      setUser(u);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const u = await apiRegister(username, password);
      setUser(u);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, isAdmin: user?.role === 'admin' };
}
