import { useState, useCallback, useEffect } from 'react';
import { fetchLogs } from '@/lib/api';

export function useStockLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async (params?: { product_id?: string; type?: string }) => {
    setLoading(true);
    try {
      const res = await fetchLogs({ ...params, limit: 100 });
      setLogs(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const getLogsByProduct = useCallback((productId: string) => {
    return logs.filter(l => l.product_id === productId);
  }, [logs]);

  const getTodayLogs = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    return logs.filter(l => l.created_at && l.created_at.startsWith(today));
  }, [logs]);

  return { logs, loading, refresh: loadLogs, addLog: () => loadLogs(), getLogsByProduct, getTodayLogs };
}
