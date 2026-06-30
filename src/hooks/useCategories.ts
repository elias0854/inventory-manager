import { useState, useCallback, useEffect } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try { setCategories(await fetchCategories()); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const addCategory = useCallback(async (name: string) => {
    try { await createCategory(name); loadCategories(); return { ok: true }; }
    catch (e: any) { return { ok: false, error: e.message }; }
  }, [loadCategories]);

  const editCategory = useCallback(async (id: string, name: string) => {
    await updateCategory(id, name);
    loadCategories();
  }, [loadCategories]);

  const removeCategory = useCallback(async (id: string) => {
    await deleteCategory(id);
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, refresh: loadCategories, addCategory, updateCategory: editCategory, deleteCategory: removeCategory };
}
