import { useState, useEffect } from 'react';
import { fetchUsers, updateUser, deleteUser } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Pencil, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('operator');
  const [editPassword, setEditPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try { setUsers(await fetchUsers()); } catch {}
  };
  useEffect(() => { loadUsers(); }, []);

  const openEdit = (u: any) => { setEditUser(u); setEditRole(u.role); setEditPassword(''); setError(''); setSuccess(''); setDialogOpen(true); };

  const handleSave = async () => {
    setError(''); setSuccess('');
    try {
      const data: any = { role: editRole };
      if (editPassword) data.password = editPassword;
      await updateUser(editUser.id, data);
      setSuccess('保存成功');
      loadUsers();
      setTimeout(() => setDialogOpen(false), 800);
    } catch (e: any) { setError(e.message); }
  };

  const handleDelete = async (u: any) => {
    if (u.id === currentUser?.id) return alert('不能删除自己的账号');
    if (window.confirm(`确定删除用户「${u.username}」吗？`)) { await deleteUser(u.id); loadUsers(); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div><h1 className="text-xl font-semibold tracking-tight">用户管理</h1><p className="text-sm text-muted-foreground mt-0.5">管理所有登录账号</p></div>
      {users.length === 0 ? <Card><CardContent className="py-16 text-center"><Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">暂无用户</p></CardContent></Card> : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <Card key={u.id} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.username} {u.id === currentUser?.id && <span className="text-xs text-muted-foreground">(当前)</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="font-normal text-[10px] mr-1">{u.role === 'admin' ? '管理员' : '操作员'}</Badge>
                    创建于 {new Date(u.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                  {u.id !== currentUser?.id && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(u)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>编辑用户 — {editUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>角色</Label><Select value={editRole} onValueChange={setEditRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">管理员</SelectItem><SelectItem value="operator">操作员</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label>新密码（留空不修改）</Label><Input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="留空则不修改密码" /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
