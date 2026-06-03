'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Tag,
  Package,
  Users,
  LogOut,
  UserCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Loader2,
  LayoutDashboard,
  KeyRound,
} from 'lucide-react';
import { getMe, logoutUser } from '@/lib/api';
import {
  getStockNavSource,
  isMonthStockPath,
  setStockNavSource,
  type StockNavSource,
} from '@/lib/stock-nav';

type NavItem = {
  name: string;
  href: string;
  icon: typeof Package;
  navSource?: StockNavSource;
  isActive: (pathname: string, stockNavSource: StockNavSource) => boolean;
};

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/stock',
    icon: LayoutDashboard,
    navSource: 'dashboard',
    isActive: (pathname, stockNavSource) =>
      pathname === '/stock' ||
      /^\/stock\/\d+$/.test(pathname) ||
      (isMonthStockPath(pathname) && stockNavSource === 'dashboard'),
  },
  {
    name: 'Stock Mgt',
    href: '/stock/current',
    icon: Package,
    navSource: 'stock-mgt',
    isActive: (pathname, stockNavSource) =>
      pathname === '/stock/current' ||
      (isMonthStockPath(pathname) && stockNavSource === 'stock-mgt'),
  },
  { name: 'Category Mgt', href: '/categories', icon: Tag, isActive: (pathname) => pathname.startsWith('/categories') },
  { name: 'Purchases', href: '/purchases', icon: ShoppingBag, isActive: (pathname) => pathname.startsWith('/purchases') },
  { name: 'Compare Stock', href: '/stock/compare', icon: GitCompare, isActive: (pathname) => pathname.startsWith('/stock/compare') },
  { name: 'User Mgt', href: '/users', icon: Users, isActive: (pathname) => pathname.startsWith('/users') },
];

export default function Sidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockNavSource, setStockNavSourceState] = useState<StockNavSource>('dashboard');

  useEffect(() => {
    setStockNavSourceState(getStockNavSource());
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setCollapsed(saved);
    onCollapsedChange?.(saved);
    getMe().then((data) => {
      setUser({ name: data.name, email: data.email });
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    router.push('/login');
  };

  return (
    <div className={`flex flex-col h-screen bg-[#1a2332] text-white transition-all duration-300 fixed left-0 top-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold">Stock Mgt</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = item.isActive(pathname, stockNavSource);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.navSource) setStockNavSource(item.navSource);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700">
        <div className={`p-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            ) : (
              <UserCircle className="w-8 h-8 text-gray-300" />
            )}
          </div>
          {!collapsed && (
            <div>
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-400">{user?.email || ''}</p>
            </div>
          )}
        </div>
        <div className="px-4 pb-4 space-y-2">
          <Link
            href="/password"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 text-sm ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Change Password' : undefined}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Change Password</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-2 w-full text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
