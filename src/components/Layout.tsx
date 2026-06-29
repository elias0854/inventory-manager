import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Package, AlertTriangle, History, FolderTree,
  LogOut, Menu, X, ChevronLeft, Sun, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: '数据看板', icon: LayoutDashboard },
  { path: '/products', label: '商品管理', icon: Package },
  { path: '/alerts', label: '库存预警', icon: AlertTriangle },
  { path: '/logs', label: '操作日志', icon: History },
  { path: '/categories', label: '分类管理', icon: FolderTree },
];

function isActive(path: string, current: string) {
  if (path === '/') return current === '/';
  return current.startsWith(path);
}

function useTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('inv_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle: toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const alertCount = products.filter(p => p.stock <= p.minStock).length;

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!sidebarCollapsed && <span className="font-semibold text-sm text-sidebar-foreground truncate">库存管家</span>}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pt-3 pb-1 space-y-1">
          {navItems.map(item => {
            const active = isActive(item.path, location.pathname);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {alertCount > 0 && item.path === '/alerts' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-sidebar-primary-foreground/15' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {alertCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-3 py-2 border-t border-sidebar-border">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              dark
                ? 'text-amber-400/80 hover:text-amber-400 hover:bg-sidebar-accent'
                : 'text-sky-400/80 hover:text-sky-400 hover:bg-sidebar-accent'
            }`}
          >
            {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!sidebarCollapsed && <span>{dark ? '浅色模式' : '深色模式'}</span>}
          </button>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border shrink-0 space-y-2">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="text-xs truncate mr-2">
              <div className="font-medium text-sidebar-foreground truncate">{user?.username}</div>
              <div className="text-sidebar-foreground/50">{user?.role === 'admin' ? '管理员' : '操作员'}</div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout} title="退出登录">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[56px]' : 'w-[220px]'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-8 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors shrink-0"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 animate-fade-in">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-12 px-4 border-b bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Package className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">库存管家</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-card px-3 py-2 space-y-1 animate-slide-up">
            {navItems.map(item => (
              <Button
                key={item.path}
                variant={isActive(item.path, location.pathname) ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNav(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录 ({user?.username})
            </Button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-5 md:p-6 lg:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex border-t bg-card safe-area-bottom">
          {navItems.map(item => {
            const active = isActive(item.path, location.pathname);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`relative flex-1 flex flex-col items-center justify-center py-1.5 text-[11px] transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {active && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />}
                <item.icon className={`h-5 w-5 mb-0.5 transition-all duration-200 ${active ? 'scale-110' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
