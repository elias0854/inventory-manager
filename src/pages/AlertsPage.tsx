import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageOpen, ArrowRight } from 'lucide-react';

export default function AlertsPage() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || '未分类';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">库存预警</h1>
        <p className="text-sm text-muted-foreground mt-0.5">低库存和售罄商品清单</p>
      </div>

      {outOfStock.length + lowStock.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-medium">一切正常</p>
            <p className="text-sm text-muted-foreground mt-1">当前没有需要预警的商品</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/products')}>
              返回商品管理 <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {outOfStock.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <h2 className="font-semibold text-red-600 dark:text-red-400">已售罄 ({outOfStock.length})</h2>
              </div>
              <div className="space-y-2">
                {outOfStock.map(p => (
                  <Card key={p.id} className="border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.sku} · {getCatName(p.categoryId)}</p>
                      </div>
                      <Badge variant="destructive" className="shrink-0 ml-3">售罄</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <h2 className="font-semibold text-amber-600 dark:text-amber-400">库存偏低 ({lowStock.length})</h2>
              </div>
              <div className="space-y-2">
                {lowStock.map(p => (
                  <Card key={p.id} className="border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.sku} · 最低预警: {p.minStock}{p.unit}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">仅剩 {p.stock}</p>
                        <p className="text-xs text-muted-foreground">{p.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
