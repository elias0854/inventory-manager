import { useState, useCallback, useEffect } from 'react';
import type { Product } from '@/types';
import { getProducts, saveProducts } from '@/lib/storage';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProducts(getProducts());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setProducts(getProducts());
  }, []);

  const addProduct = useCallback((data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const all = getProducts();
    const now = new Date().toISOString();
    const p: Product = { ...data, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), createdAt: now, updatedAt: now };
    saveProducts([...all, p]);
    refresh();
    return p;
  }, [refresh]);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    const all = getProducts();
    const updated = all.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    saveProducts(updated);
    refresh();
  }, [refresh]);

  const deleteProduct = useCallback((id: string) => {
    const all = getProducts().filter(p => p.id !== id);
    saveProducts(all);
    refresh();
  }, [refresh]);

  const updateStock = useCallback((id: string, newStock: number) => {
    const all = getProducts();
    const updated = all.map(p => p.id === id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p);
    saveProducts(updated);
    refresh();
  }, [refresh]);

  return { products, loading, refresh, addProduct, updateProduct, deleteProduct, updateStock };
}
