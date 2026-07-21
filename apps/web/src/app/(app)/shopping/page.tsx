'use client';

import * as React from 'react';
import { Search, Heart, Bell, Tag, ShoppingBag, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SearchPanel } from '@/components/shopping/search-panel';
import { WishlistPanel } from '@/components/shopping/wishlist-panel';
import { MonitorsPanel } from '@/components/shopping/monitors-panel';
import { CouponsPanel } from '@/components/shopping/coupons-panel';
import { useWishlist, useMonitors, useCoupons } from '@/hooks/api/use-shopping';

const TABS = [
  { id: 'search', label: 'Buscar', icon: Search },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'monitors', label: 'Monitores', icon: Bell },
  { id: 'coupons', label: 'Cupons', icon: Tag },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ShoppingPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>('search');
  const { data: wishlistData } = useWishlist();
  const { data: monitorsData } = useMonitors();
  const { data: couponsData } = useCoupons();

  const wishlistCount = React.useMemo(() => {
    if (!wishlistData) return 0;
    return (wishlistData.items || []).length;
  }, [wishlistData]);

  const monitorsCount = React.useMemo(() => {
    if (!monitorsData) return 0;
    return monitorsData.length;
  }, [monitorsData]);

  const couponsCount = React.useMemo(() => {
    if (!couponsData) return 0;
    return (couponsData.coupons || []).length;
  }, [couponsData]);

  const potentialSavings = React.useMemo(() => {
    if (!wishlistData) return 0;
    const items = wishlistData.items || [];
    return items.reduce((acc: number, item: any) => acc + (item.target_price > 0 ? Math.max(0, item.current_price - item.target_price) : 0), 0);
  }, [wishlistData]);

  const alertsCount = React.useMemo(() => {
    if (!monitorsData) return 0;
    return monitorsData.filter((m: any) => m.target_price > 0 && m.current_price > 0 && m.current_price <= m.target_price).length;
  }, [monitorsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Shopping</h1>
        <p className="text-muted-foreground">Compare preços em 7 lojas simultaneamente</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: ShoppingBag, label: 'Itens na Wishlist', value: wishlistCount.toString(), color: 'bg-pink-500/10 text-pink-500' },
          { icon: TrendingDown, label: 'Economia Potencial', value: formatCurrency(potentialSavings), color: 'bg-success/10 text-success' },
          { icon: Bell, label: 'Alertas Ativos', value: alertsCount.toString(), color: 'bg-violet-500/10 text-violet-500' },
          { icon: Tag, label: 'Cupons Disponíveis', value: couponsCount.toString(), color: 'bg-amber-500/10 text-amber-500' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === 'wishlist' && wishlistCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-pink-500/20 text-pink-600 text-xs font-bold flex items-center justify-center">{wishlistCount}</span>
            )}
            {tab.id === 'monitors' && monitorsCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-violet-500/20 text-violet-600 text-xs font-bold flex items-center justify-center">{monitorsCount}</span>
            )}
            {tab.id === 'coupons' && couponsCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold flex items-center justify-center">{couponsCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        {activeTab === 'search' && <SearchPanel />}
        {activeTab === 'wishlist' && <WishlistPanel />}
        {activeTab === 'monitors' && <MonitorsPanel />}
        {activeTab === 'coupons' && <CouponsPanel />}
      </div>
    </div>
  );
}
