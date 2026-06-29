import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useStockLogs } from '@/hooks/useStockLogs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Archive, ArrowRight } from 'lucide-react';
import { History as HistoryIcon } from 'lucide-react';

export default function DashboardPage() {
  const { products } = useProducts();
  const { logs } = useStockLogs();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter(l => l.createdAt.startsWith(today));

    return {
      totalProducts: products.length,
      totalStock: products.reduce((s, p) => s + p.stock, 0),
      totalValue: products.reduce((s, p) => s + p.price * p.stock, 0),
      todayInCount: todayLogs.filter(l => l.type === 'in').reduce((s, l) => s + l.quantity, 0),
      todayOutCount: todayLogs.filter(l => l.type === 'out').reduce((s, l) => s + l.quantity, 0),
      lowStockCount: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
      outOfStockCount: products.filter(p => p.stock === 0).length,
    };
  }, [products, logs]);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const recentLogs = logs.slice(0, 6);

  const statCards = [
    {
      label: '商品总数', value: stats.totalProducts.toLocaleString(),
      icon: Package, color: 'border-l-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: '库存总量', value: stats.totalStock.toLocaleString(),
      icon: Archive, color: 'border-l-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-500/10', iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: '库存总值', value: `¥${stats.totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign, color: 'border-l-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: '预警商品', value: (stats.lowStockCount + stats.outOfStockCount).toLocaleString(),
      sub: `售罄${stats.outOfStockCount} · 偏低${stats.lowStockCount}`,
      icon: AlertTriangle, color: stats.outOfStockCount + stats.lowStockCount > 0 ? 'border-l-red-500' : 'border-l-emerald-500',
      bg: stats.outOfStockCount + stats.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: stats.outOfStockCount + stats.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      hasAlert: stats.outOfStockCount + stats.lowStockCount > 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">数据看板</h1>
        <p className="text-sm text-muted-foreground mt-0.5">库存实时概览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label} className={`border-l-[3px] ${card.color} shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{card.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  {'sub' in card && card.sub && card.hasAlert && (
                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                  )}
                </div>
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Activity + Recent Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold tracking-tight">今日动态</p>
            <div className="h-px bg-border my-3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">今日入库</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">+{stats.todayInCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">今日出库</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400 tracking-tight">-{stats.todayOutCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-tight">最近操作</p>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/logs')}>
                查看全部 <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="h-px bg-border my-3" />
            {recentLogs.length === 0 ? (
              <div className="py-6 text-center">
                <HistoryIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">暂无操作记录</p>
                <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => navigate('/products')}>
                  去操作商品入库
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{log.productName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge variant={log.type === 'in' ? 'default' : 'destructive'} className="text-[10px] font-normal">
                        {log.type === 'in' ? '入库' : '出库'}
                      </Badge>
                      <span className={`text-sm font-semibold tabular-nums ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {log.type === 'in' ? '+' : '-'}{log.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="shadow-sm border-l-[3px] border-l-red-500 animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                库存预警
              </p>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate('/alerts')}>查看全部</Button>
            </div>
            <div className="space-y-2">
              {outOfStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-500/5 rounded-lg px-3 py-2.5 border border-red-100 dark:border-red-500/10">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs font-mono">{p.sku}</span>
                  </div>
                  <Badge variant="destructive" className="shrink-0">售罄</Badge>
                </div>
              ))}
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-500/5 rounded-lg px-3 py-2.5 border border-amber-100 dark:border-amber-500/10">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">预警: &lt;{p.minStock}</span>
                  </div>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm shrink-0 ml-3">仅剩 {p.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
