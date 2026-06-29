import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/types';
import { getUsers, saveUsers, getCurrentUser, saveCurrentUser, generateId, nowStr } from '@/lib/storage';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback((username: string, password: string): { ok: boolean; error?: string } => {
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return { ok: false, error: '用户名或密码错误' };
    const authUser: AuthUser = { id: found.id, username: found.username, role: found.role };
    saveCurrentUser(authUser);
    setUser(authUser);
    return { ok: true };
  }, []);

  const register = useCallback((username: string, password: string): { ok: boolean; error?: string } => {
    const users = getUsers();
    if (users.find(u => u.username === username)) return { ok: false, error: '用户名已存在' };
    const newUser = { id: generateId(), username, password, role: 'operator' as const, createdAt: nowStr() };
    saveUsers([...users, newUser]);
    return login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    saveCurrentUser(null);
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, isAdmin: user?.role === 'admin' };
}
