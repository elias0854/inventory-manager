import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchChartTrend, fetchChartCategory } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Archive, ArrowRight } from 'lucide-react';
import { History as HistoryIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [catData, setCatData] = useState<any[]>([]);
  const [trendDays, setTrendDays] = useState(7);
  const navigate = useNavigate();
  const COLORS = ['hsl(32 95% 44%)', 'hsl(200 95% 44%)', 'hsl(142 71% 40%)', 'hsl(280 95% 44%)', 'hsl(0 84% 52%)', 'hsl(60 95% 44%)'];

  useEffect(() => { fetchDashboardStats().then(setStats); }, []);
  useEffect(() => { fetchChartTrend(trendDays).then(setTrendData); }, [trendDays]);
  useEffect(() => { fetchChartCategory().then(setCatData); }, []);

  if (!stats) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">加载中...</p></div>;

  const lowStock = (stats.lowStockProducts || []).filter((p: any) => p.stock > 0);
  const outOfStock = (stats.lowStockProducts || []).filter((p: any) => p.stock === 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold tracking-tight">数据看板</h1><p className="text-sm text-muted-foreground mt-0.5">库存实时概览</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '商品总数', value: stats.totalProducts, icon: Package, clr: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', ic: 'text-amber-600 dark:text-amber-400', to: '/products' },
          { label: '库存总量', value: stats.totalStock.toLocaleString(), icon: Archive, clr: 'border-l-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', ic: 'text-sky-600 dark:text-sky-400', to: '/products' },
          { label: '库存总值', value: '¥' + stats.totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 }), icon: DollarSign, clr: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', ic: 'text-emerald-600 dark:text-emerald-400', to: '/products' },
          { label: '预警商品', value: stats.lowStockCount + stats.outOfStockCount, sub: `售罄${stats.outOfStockCount} · 偏低${stats.lowStockCount}`, icon: AlertTriangle, clr: stats.outOfStockCount + stats.lowStockCount > 0 ? 'border-l-red-500' : 'border-l-emerald-500', bg: stats.outOfStockCount + stats.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10', ic: stats.outOfStockCount + stats.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400', to: '/alerts' },
        ].map(card => (
          <Card key={card.label} className={`border-l-[3px] ${card.clr} shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`} onClick={() => navigate(card.to)} title={`点击跳转到${card.label}`}>
            <CardContent className="p-5"><div className="flex items-start justify-between"><div className="space-y-1"><p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{card.label}</p><p className="text-2xl font-bold tracking-tight">{card.value}</p>{(card as any).sub && <p className="text-xs text-muted-foreground">{(card as any).sub}</p>}</div><div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}><card.icon className={`h-5 w-5 ${card.ic}`} /></div></div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm"><CardContent className="p-5"><p className="text-sm font-semibold tracking-tight">今日动态</p><div className="h-px bg-border my-3" /><div className="grid grid-cols-2 gap-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">今日入库</p><p className="text-xl font-bold text-emerald-600 tracking-tight">+{stats.todayInCount}</p></div></div><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" /></div><div><p className="text-xs text-muted-foreground">今日出库</p><p className="text-xl font-bold text-orange-600 tracking-tight">-{stats.todayOutCount}</p></div></div></div></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold tracking-tight">最近操作</p><Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/logs')}>查看全部 <ArrowRight className="h-3 w-3 ml-1" /></Button></div><div className="h-px bg-border my-3" />{(stats.recentLogs || []).length === 0 ? <div className="py-6 text-center"><HistoryIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">暂无操作记录</p></div> : <div className="space-y-2.5">{(stats.recentLogs || []).map((log: any) => (<div key={log.id} className="flex items-center justify-between text-sm"><div className="flex-1 min-w-0"><p className="truncate font-medium">{log.product_name}</p><p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('zh-CN')}</p></div><div className="flex items-center gap-2 ml-3 shrink-0"><Badge variant={log.type === 'in' ? 'default' : 'destructive'} className="text-[10px] font-normal">{log.type === 'in' ? '入库' : '出库'}</Badge><span className={`text-sm font-semibold tabular-nums ${log.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>{log.type === 'in' ? '+' : '-'}{log.quantity}</span></div></div>))}</div>}</CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold tracking-tight">出入库趋势</p><div className="flex gap-1">{[7, 30].map(d => <Button key={d} variant={trendDays === d ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setTrendDays(d)}>{d}天</Button>)}</div></div><ResponsiveContainer width="100%" height={200}><BarChart data={trendData}><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} width={40} /><Tooltip /><Bar dataKey="in" name="入库" fill="hsl(142 71% 45%)" radius={[4,4,0,0]} /><Bar dataKey="out" name="出库" fill="hsl(0 84% 52%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-5"><p className="text-sm font-semibold tracking-tight mb-4">分类商品数</p><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={catData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, count }: any) => `${name} ${count}个`}>{catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <Card className="shadow-sm border-l-[3px] border-l-red-500 animate-slide-up"><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold tracking-tight flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />库存预警</p><Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate('/alerts')}>查看全部</Button></div><div className="space-y-2">{outOfStock.map((p: any) => (<div key={p.id} className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-500/5 rounded-lg px-3 py-2.5 border border-red-100 dark:border-red-500/10"><div><span className="font-medium">{p.name}</span><span className="text-muted-foreground ml-2 text-xs font-mono">{p.sku}</span></div><Badge variant="destructive" className="shrink-0">售罄</Badge></div>))}{lowStock.map((p: any) => (<div key={p.id} className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-500/5 rounded-lg px-3 py-2.5 border border-amber-100 dark:border-amber-500/10"><div><span className="font-medium">{p.name}</span><span className="text-muted-foreground ml-2 text-xs">预警: &lt;{p.min_stock}</span></div><span className="text-amber-600 font-semibold text-sm shrink-0 ml-3">仅剩 {p.stock}</span></div>))}</div></CardContent></Card>
      )}
    </div>
  );
}
