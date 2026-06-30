import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { stockIn, stockOut, batchDeleteProducts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Search, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, Grid3X3, List, Package } from 'lucide-react';

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { products, total, loading, loadProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockNote, setStockNote] = useState('');
  const [stockError, setStockError] = useState('');

  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCat, setFormCat] = useState('');
  const [formUnit, setFormUnit] = useState('个');
  const [formPrice, setFormPrice] = useState('');
  const [formMinStock, setFormMinStock] = useState('10');

  useEffect(() => {
    loadProducts({ search, category_id: filterCat, page });
  }, [page, search, filterCat, loadProducts]);

  const getCatName = (id: string) => categories.find((c: any) => c.id === id)?.name || '未分类';

  const openAdd = () => {
    setEditingProduct(null);
    setFormName(''); setFormSku(''); setFormCat(categories[0]?.id || '');
    setFormUnit('个'); setFormPrice(''); setFormMinStock('10');
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name); setFormSku(p.sku); setFormCat(p.category_id || '');
    setFormUnit(p.unit); setFormPrice(String(p.price)); setFormMinStock(String(p.min_stock));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formSku) return;
    const data = {
      name: formName, sku: formSku, category_id: formCat,
      unit: formUnit, price: Number(formPrice) || 0,
      min_stock: Number(formMinStock) || 0,
    };
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
    setDialogOpen(false);
  };

  const openStock = (product: any, type: 'in' | 'out') => {
    setStockProduct(product); setStockType(type); setStockQty(''); setStockNote(''); setStockError('');
    setStockDialogOpen(true);
  };

  const handleStock = async () => {
    if (!stockProduct) return;
    const qty = Number(stockQty);
    if (!qty || qty <= 0) { setStockError('请输入有效数量'); return; }
    try {
      if (stockType === 'in') await stockIn(stockProduct.id, qty, stockNote);
      else await stockOut(stockProduct.id, qty, stockNote);
      loadProducts({ search, category_id: filterCat, page });
      setStockDialogOpen(false);
    } catch (e: any) {
      setStockError(e.message);
    }
  };

  const handleDelete = async (p: any) => {
    if (window.confirm(`确定要删除商品「${p.name}」吗？`)) await deleteProduct(p.id);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    if (window.confirm(`确定要删除选中的 ${selected.size} 个商品吗？`)) {
      await batchDeleteProducts([...selected]);
      setSelected(new Set());
      loadProducts({ search, category_id: filterCat, page });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">商品管理</h1>
          <p className="text-sm text-muted-foreground">共 {total} 个商品</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4 mr-1" />删除({selected.size})
              </Button>
            )}
            <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />新增商品</Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap bg-card rounded-lg border p-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 border-0 bg-transparent h-9" placeholder="搜索商品名称或 SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={filterCat} onValueChange={v => { setFilterCat(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="全部分类" /></SelectTrigger>
          <SelectContent><SelectItem value="all">全部分类</SelectItem>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <div className="hidden md:flex border rounded-md">
          <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('card')}><Grid3X3 className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className={viewMode === 'table' ? 'hidden md:block' : 'hidden'}>
            <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {isAdmin && <TableHead className="w-10"><input type="checkbox" onChange={e => { if (e.target.checked) setSelected(new Set(products.map((p: any) => p.id))); else setSelected(new Set()); }} checked={selected.size === products.length && products.length > 0} /></TableHead>}
                  <TableHead>商品名称</TableHead><TableHead>SKU</TableHead><TableHead>分类</TableHead><TableHead className="text-right">单价</TableHead><TableHead className="text-right">库存</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                    <div className="flex flex-col items-center"><Package className="h-10 w-10 text-muted-foreground/30 mb-3" /><p className="text-muted-foreground text-sm">暂无商品数据</p>{isAdmin && <Button size="sm" className="mt-3" onClick={openAdd}><Plus className="h-3 w-3 mr-1" />添加第一个商品</Button>}</div>
                  </TableCell></TableRow>
                ) : products.map((p: any) => (
                  <TableRow key={p.id}>
                    {isAdmin && <TableCell><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></TableCell>}
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{p.sku}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{getCatName(p.category_id)}</Badge></TableCell>
                    <TableCell className="text-right">¥{p.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right"><span className={p.stock <= p.min_stock ? 'text-destructive font-semibold' : 'font-medium'}>{p.stock?.toLocaleString()}</span><span className="text-muted-foreground text-xs ml-1">{p.unit}</span></TableCell>
                    <TableCell>{p.stock === 0 ? <Badge variant="destructive">售罄</Badge> : p.stock <= p.min_stock ? <Badge className="bg-amber-500 hover:bg-amber-500">偏低</Badge> : <Badge variant="outline" className="text-emerald-600 border-emerald-200">正常</Badge>}</TableCell>
                    <TableCell className="text-right"><div className="flex justify-end gap-0.5"><Button variant="ghost" size="icon" className="h-8 w-8" title="入库" onClick={() => openStock(p, 'in')}><ArrowDownToLine className="h-4 w-4 text-green-600" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" title="出库" onClick={() => openStock(p, 'out')} disabled={p.stock === 0}><ArrowUpFromLine className="h-4 w-4 text-orange-600" /></Button>{isAdmin && <><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button></>}</div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </div>

          {Math.ceil(total / PAGE_SIZE) > 1 && (
            <Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>{Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1).map(p => <PaginationItem key={p}><PaginationLink isActive={p === page} onClick={() => setPage(p)}>{p}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext onClick={() => setPage(p => p + 1)} className={page >= Math.ceil(total / PAGE_SIZE) ? 'pointer-events-none opacity-50' : ''} /></PaginationItem></PaginationContent></Pagination>
          )}

          <div className={viewMode === 'card' ? 'space-y-3' : 'md:hidden space-y-3'}>
            {products.length === 0 ? <div className="text-center py-16"><Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground text-sm">暂无商品数据</p></div> : products.map((p: any) => (
              <Card key={p.id}><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-medium truncate">{p.name}</span>{p.stock === 0 && <Badge variant="destructive" className="text-[10px] shrink-0">售罄</Badge>}{p.stock > 0 && p.stock <= p.min_stock && <Badge className="bg-amber-500 text-[10px] shrink-0">偏低</Badge>}</div><div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><span className="font-mono">{p.sku}</span><span>·</span><span>{getCatName(p.category_id)}</span></div><div className="flex items-center gap-3 mt-2"><span className="text-sm font-semibold">¥{p.price?.toFixed(2)}</span><span className={`text-sm ${p.stock <= p.min_stock ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>库存 {p.stock} {p.unit}</span></div></div><div className="flex flex-col gap-1.5 shrink-0"><Button size="sm" variant="outline" onClick={() => openStock(p, 'in')}><ArrowDownToLine className="h-3.5 w-3.5 mr-1" />入库</Button><Button size="sm" variant="outline" onClick={() => openStock(p, 'out')} disabled={p.stock === 0}><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" />出库</Button>{isAdmin && <div className="flex gap-1 justify-center mt-0.5"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>}</div></div></CardContent></Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingProduct ? '编辑商品' : '新增商品'}</DialogTitle></DialogHeader><div className="space-y-3"><div className="space-y-1.5"><Label>商品名称 *</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="例如：无线鼠标" /></div><div className="space-y-1.5"><Label>SKU *</Label><Input value={formSku} onChange={e => setFormSku(e.target.value)} placeholder="例如：WM-001" /></div><div className="space-y-1.5"><Label>分类</Label><Select value={formCat} onValueChange={setFormCat}><SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger><SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>单位</Label><Input value={formUnit} onChange={e => setFormUnit(e.target.value)} /></div><div className="space-y-1.5"><Label>单价 (¥)</Label><Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0" /></div></div><div className="space-y-1.5"><Label>最低库存预警</Label><Input type="number" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} placeholder="10" /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave}>{editingProduct ? '保存' : '创建'}</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{stockType === 'in' ? '商品入库' : '商品出库'} — {stockProduct?.name}</DialogTitle></DialogHeader><div className="space-y-3"><p className="text-sm text-muted-foreground">当前库存: <span className="font-medium text-foreground">{stockProduct?.stock} {stockProduct?.unit}</span></p><div className="space-y-1.5"><Label>{stockType === 'in' ? '入库数量' : '出库数量'} *</Label><Input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="请输入数量" autoFocus /></div><div className="space-y-1.5"><Label>备注</Label><Input value={stockNote} onChange={e => setStockNote(e.target.value)} placeholder={stockType === 'in' ? '入库备注' : '出库备注'} /></div>{stockError && <p className="text-sm text-destructive">{stockError}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setStockDialogOpen(false)}>取消</Button><Button onClick={handleStock}>{stockType === 'in' ? '确认入库' : '确认出库'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
