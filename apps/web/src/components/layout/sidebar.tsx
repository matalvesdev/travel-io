'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Wallet, TrendingUp, Plane, ShoppingBag,
  Target, MessageSquare, BarChart3, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Sparkles, Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Finanças', href: '/finance', icon: Wallet },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp },
  { name: 'Viagens & Milhas', href: '/travel', icon: Plane },
  { name: 'Minhas Viagens', href: '/trips', icon: Map },
  { name: 'IA Travel', href: '/ai-travel', icon: Sparkles },
  { name: 'Shopping', href: '/shopping', icon: ShoppingBag },
  { name: 'Objetivos', href: '/goals', icon: Target },
  { name: 'Assistente IA', href: '/ai', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Notificações', href: '/notifications', icon: Bell },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps { collapsed?: boolean; onToggle?: () => void; }

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const initials = React.useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.split(' ').filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }, [user?.name]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  return (
    <motion.aside initial={false} animate={{ width: collapsed ? 72 : 256 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen phantom-card border-r border-white/5">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight">TRAVEL.IO</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2 mt-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}
                className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}
                className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{initials}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[hsl(0,0%,10%)] bg-success" />
            </div>
            {!collapsed && <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p><p className="text-xs text-muted-foreground">Pro Plan</p></div>}
            {!collapsed && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
