import { useState, useCallback, useEffect } from 'react';
import type { StockLog } from '@/types';
import { getStockLogs, saveStockLogs } from '@/lib/storage';

export function useStockLogs() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLogs(getStockLogs());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => setLogs(getStockLogs()), []);

  const addLog = useCallback((log: StockLog) => {
    const all = getStockLogs();
    saveStockLogs([log, ...all]);
    refresh();
  }, [refresh]);

  const getLogsByProduct = useCallback((productId: string) => {
    return logs.filter(l => l.productId === productId);
  }, [logs]);

  const getTodayLogs = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    return logs.filter(l => l.createdAt.startsWith(today));
  }, [logs]);

  return { logs, loading, refresh, addLog, getLogsByProduct, getTodayLogs };
}
