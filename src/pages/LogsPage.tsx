import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockLogs } from '@/hooks/useStockLogs';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { History, ArrowRight } from 'lucide-react';

export default function LogsPage() {
  const { logs } = useStockLogs();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = logs.filter(l => {
    if (filterProduct !== 'all' && l.productId !== filterProduct) return false;
    if (filterType !== 'all' && l.type !== filterType) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">操作日志</h1>
          <p className="text-sm text-muted-foreground mt-0.5">出入库操作记录</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="全部商品" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部商品</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="全部类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="in">入库</SelectItem>
            <SelectItem value="out">出库</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <History className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">暂无操作记录</p>
            <p className="text-sm text-muted-foreground mt-1">
              {logs.length === 0 ? '还没有任何出入库操作' : '当前筛选条件下没有记录'}
            </p>
            {logs.length === 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/products')}>
                去管理商品 <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => (
            <Card key={log.id} className={`shadow-sm animate-fade-in hover:shadow-md transition-shadow duration-200`} style={{ animationDelay: `${i * 30}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{log.productName}</span>
                      <Badge variant={log.type === 'in' ? 'default' : 'destructive'} className="shrink-0 font-normal text-[10px]">
                        {log.type === 'in' ? '入库' : '出库'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.note} · {log.username} · {new Date(log.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold tabular-nums tracking-tight ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {log.type === 'in' ? '+' : '-'}{log.quantity}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {log.before} → {log.after}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
