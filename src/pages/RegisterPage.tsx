import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('两次密码不一致'); return; }
    if (password.length < 3) { setError('密码至少3位'); return; }
    setLoading(true);
    const result = await register(username, password);
    setLoading(false);
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>注册账号</CardTitle>
          <CardDescription>创建你的库存管家账号</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码（至少3位）" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">确认密码</Label>
              <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="请再次输入密码" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
            <p className="text-xs text-muted-foreground">
              已有账号？<Link to="/login" className="text-primary hover:underline">登录</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
