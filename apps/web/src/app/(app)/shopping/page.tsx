'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Bell, Tag, ShoppingBag, TrendingDown, Percent, Loader2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/analytics/metric-card';
import { SearchPanel } from '@/components/shopping/search-panel';
import { WishlistPanel } from '@/components/shopping/wishlist-panel';
import { MonitorsPanel } from '@/components/shopping/monitors-panel';
import { CouponsPanel } from '@/components/shopping/coupons-panel';
import { DealsPanel } from '@/components/shopping/deals-panel';
import { useWishlist, useMonitors, useCoupons, useDeals } from '@/hooks/api/use-shopping';

const TABS = [
  { id: 'search', label: 'Buscar', icon: Search, color: 'text-blue-500' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, color: 'text-pink-500' },
  { id: 'monitors', label: 'Monitores', icon: Bell, color: 'text-violet-500' },
  { id: 'deals', label: 'Ofertas', icon: Percent, color: 'text-green-500' },
  { id: 'coupons', label: 'Cupons', icon: Tag, color: 'text-amber-500' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ShoppingPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>('search');
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();
  const { data: monitorsData, isLoading: monitorsLoading } = useMonitors();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();

  const wishlistCount = React.useMemo(() => {
    if (!wishlistData) return 0;
    return (wishlistData.items || []).length;
  }, [wishlistData]);

  const monitorsCount = React.useMemo(() => {
    if (!monitorsData) return 0;
    return (monitorsData.monitors || []).length;
  }, [monitorsData]);

  const couponsCount = React.useMemo(() => {
    if (!couponsData) return 0;
    return (couponsData.coupons || []).length;
  }, [couponsData]);

  const dealsCount = React.useMemo(() => {
    if (!dealsData) return 0;
    return (dealsData.deals || []).length;
  }, [dealsData]);

  const potentialSavings = React.useMemo(() => {
    if (!wishlistData) return 0;
    const items = wishlistData.items || [];
    return items.reduce((acc: number, item: any) => {
      const current = Number(item.currentPrice) || 0;
      const target = Number(item.targetPrice) || 0;
      return acc + (target > 0 ? Math.max(0, current - target) : 0);
    }, 0);
  }, [wishlistData]);

  const alertsCount = React.useMemo(() => {
    if (!monitorsData) return 0;
    const monitors = monitorsData.monitors || [];
    return monitors.filter((m: any) => {
      const target = Number(m.targetPrice) || 0;
      const current = Number(m.currentPrice) || 0;
      return target > 0 && current > 0 && current <= target;
    }).length;
  }, [monitorsData]);

  const totalDealsSavings = React.useMemo(() => {
    if (!dealsData) return 0;
    const deals = dealsData.deals || [];
    return deals.reduce((acc: number, deal: any) => acc + (Number(deal.savings) || 0), 0);
  }, [dealsData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Shopping
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare preços em 7 lojas simultaneamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            7 lojas disponíveis
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            title="Itens na Wishlist"
            value={wishlistLoading ? '...' : wishlistCount.toString()}
            icon={Heart}
            iconColor="text-pink-500"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricCard
            title="Economia Potencial"
            value={wishlistLoading ? '...' : formatCurrency(potentialSavings)}
            icon={TrendingDown}
            iconColor="text-success"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricCard
            title="Alertas Ativos"
            value={monitorsLoading ? '...' : alertsCount.toString()}
            icon={Bell}
            iconColor="text-violet-500"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricCard
            title="Ofertas Disponíveis"
            value={dealsLoading ? '...' : dealsCount.toString()}
            icon={Percent}
            iconColor="text-green-500"
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-1 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-1"
      >
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'wishlist' ? wishlistCount :
                       tab.id === 'monitors' ? monitorsCount :
                       tab.id === 'deals' ? dealsCount :
                       tab.id === 'coupons' ? couponsCount : 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${isActive ? '' : tab.color}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span className={`ml-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  isActive 
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : `${tab.color.replace('text-', 'bg-')}/20 ${tab.color}`
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6"
        >
          {activeTab === 'search' && <SearchPanel />}
          {activeTab === 'wishlist' && <WishlistPanel />}
          {activeTab === 'monitors' && <MonitorsPanel />}
          {activeTab === 'deals' && <DealsPanel />}
          {activeTab === 'coupons' && <CouponsPanel />}
        </motion.div>
      </AnimatePresence>

      {/* Savings Summary */}
      {(potentialSavings > 0 || totalDealsSavings > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-success/20 bg-success/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-success/10 p-2">
              <Sparkles className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-success">
                Economia total potencial
              </p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(potentialSavings + totalDealsSavings)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
