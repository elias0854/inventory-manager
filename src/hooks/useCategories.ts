import { useState, useCallback, useEffect } from 'react';
import type { Category } from '@/types';
import { getCategories, saveCategories, generateId, nowStr } from '@/lib/storage';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategories(getCategories());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => setCategories(getCategories()), []);

  const addCategory = useCallback((name: string) => {
    const all = getCategories();
    if (all.find(c => c.name === name)) return { ok: false, error: '分类已存在' };
    const cat: Category = { id: generateId(), name, createdAt: nowStr() };
    saveCategories([...all, cat]);
    refresh();
    return { ok: true };
  }, [refresh]);

  const updateCategory = useCallback((id: string, name: string) => {
    const all = getCategories();
    saveCategories(all.map(c => c.id === id ? { ...c, name } : c));
    refresh();
  }, [refresh]);

  const deleteCategory = useCallback((id: string) => {
    const all = getCategories().filter(c => c.id !== id);
    saveCategories(all);
    refresh();
  }, [refresh]);

  return { categories, loading, refresh, addCategory, updateCategory, deleteCategory };
}
