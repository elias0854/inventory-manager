import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Plus, Pencil, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const getProductCount = (catId: string) => products.filter(p => p.categoryId === catId).length;

  const openAdd = () => { setEditId(null); setName(''); setError(''); setDialogOpen(true); };
  const openEdit = (id: string, currentName: string) => { setEditId(id); setName(currentName); setError(''); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim()) { setError('请输入分类名称'); return; }
    if (editId) {
      updateCategory(editId, name.trim());
    } else {
      const result = addCategory(name.trim());
      if (!result.ok) { setError(result.error || '添加失败'); return; }
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    const count = getProductCount(id);
    const msg = count > 0 ? `该分类下有 ${count} 个商品，删除后这些商品将变为未分类。确定删除「${catName}」吗？` : `确定删除分类「${catName}」吗？`;
    if (window.confirm(msg)) deleteCategory(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">分类管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{categories.length} 个分类 · {products.length} 个商品</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />新增分类</Button>
      </div>

      {categories.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderTree className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">暂无分类</p>
            <p className="text-sm text-muted-foreground mt-1">创建分类来更好地管理商品</p>
            <Button size="sm" className="mt-4" onClick={openAdd}><Plus className="h-3 w-3 mr-1" />创建第一个分类</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <Card key={cat.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Badge variant="secondary" className="font-normal text-[10px] mr-1">{getProductCount(cat.id)}</Badge>
                    个商品
                  </p>
                </div>
                <div className="flex gap-0.5 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat.id, cat.name)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cat.id, cat.name)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? '编辑分类' : '新增分类'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>分类名称</Label>
            <Input value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="例如：电子产品" autoFocus />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>{editId ? '保存' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
