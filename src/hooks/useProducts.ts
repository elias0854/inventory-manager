import { useState, useCallback, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, stockIn, stockOut } from '@/lib/api';

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (params?: { search?: string; category_id?: string; page?: number }) => {
    setLoading(true);
    try {
      const res = await fetchProducts({ ...params, limit: params?.page ? 10 : 1000 });
      setProducts(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addProduct = useCallback(async (data: any) => {
    const p = await createProduct(data);
    await loadProducts();
    return p;
  }, [loadProducts]);

  const editProduct = useCallback(async (id: string, data: any) => {
    await updateProduct(id, data);
    loadProducts();
  }, [loadProducts]);

  const removeProduct = useCallback(async (id: string) => {
    await deleteProduct(id);
    loadProducts();
  }, [loadProducts]);

  const doStockIn = useCallback(async (product_id: string, quantity: number, note?: string) => {
    return stockIn(product_id, quantity, note);
  }, []);

  const doStockOut = useCallback(async (product_id: string, quantity: number, note?: string) => {
    return stockOut(product_id, quantity, note);
  }, []);

  return { products, total, loading, loadProducts, addProduct, updateProduct: editProduct, deleteProduct: removeProduct, updateStock: loadProducts, doStockIn, doStockOut };
}
