'use client';

import * as React from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCoupons } from '@/hooks/api/use-shopping';
import type { Coupon } from '@/lib/api/shopping';

export function CouponsPanel() {
  const { data: couponsData, isLoading } = useCoupons();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedStore, setSelectedStore] = React.useState('all');

  const coupons: Coupon[] = React.useMemo(() => {
    if (!couponsData) return [];
    return couponsData.coupons || [];
  }, [couponsData]);

  const storeNames = React.useMemo(() => {
    const names = [...new Set(coupons.map(c => c.store_name))].sort();
    return names;
  }, [coupons]);

  const filteredCoupons = React.useMemo(() => {
    if (selectedStore === 'all') return coupons;
    return coupons.filter(c => c.store_name === selectedStore);
  }, [coupons, selectedStore]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-4">
            <div className="space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-8 w-1/4 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
        <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum cupom disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Tag className="h-5 w-5 text-amber-500" />
        <span className="text-sm text-muted-foreground">{filteredCoupons.length} cupom(ns)</span>
      </div>

      {/* Store Filter */}
      {storeNames.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStore('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStore === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Todas as Lojas
          </button>
          {storeNames.map(store => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedStore === store
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {store}
            </button>
          ))}
        </div>
      )}

      {/* Coupons Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredCoupons.map(coupon => {
          const daysLeft = coupon.end_date ? Math.max(0, Math.ceil((new Date(coupon.end_date).getTime() - Date.now()) / 86400000)) : 7;
          const isCopied = copiedId === coupon.id;

          return (
            <div key={coupon.id} className="rounded-xl border border-dashed border-border/80 p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{coupon.store_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                  {coupon.min_purchase > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">Compra mínima: {formatCurrency(coupon.min_purchase)}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">{coupon.value}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleCopy(coupon.code, coupon.id)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {isCopied ? <><Check className="h-3 w-3" /> Copiado!</> : <><Copy className="h-3 w-3" /> Copiar</>}
                  </button>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${daysLeft <= 2 ? 'bg-destructive/10 text-destructive' : daysLeft <= 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-success/10 text-success'}`}>
                  {daysLeft}d restante{daysLeft !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
