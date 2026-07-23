'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Percent, ExternalLink, Store, Tag, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useDeals } from '@/hooks/api/use-shopping';

const STORE_COLORS: Record<string, string> = {
  'Amazon': '#FF9900',
  'Mercado Livre': '#FFE600',
  'Magazine Luiza': '#E41E2C',
  'Casas Bahia': '#0066CC',
  'AliExpress': '#E43225',
  'Shopee': '#EE4D2D',
  'Netshoes': '#00A859',
};

export function DealsPanel() {
  const [selectedStore, setSelectedStore] = React.useState<string>('all');
  const { data: dealsData, isLoading } = useDeals({ category: selectedStore === 'all' ? undefined : selectedStore });

  const deals = dealsData?.deals || [];
  
  const stores = React.useMemo(() => {
    const uniqueStores = [...new Set(deals.map((d: any) => d.storeName))];
    return ['all', ...uniqueStores];
  }, [deals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium text-muted-foreground">Nenhuma oferta disponível</p>
        <p className="text-sm text-muted-foreground mt-1">Ofertas aparecerão aqui quando estiverem disponíveis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Store Filter */}
      <div className="flex flex-wrap gap-2">
        {stores.map(store => (
          <button
            key={store}
            onClick={() => setSelectedStore(store)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStore === store
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {store === 'all' ? 'Todas as Lojas' : store}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal: any, index: number) => {
          const discount = deal.originalPrice > 0 
            ? Math.round((1 - deal.dealPrice / deal.originalPrice) * 100) 
            : 0;
          
          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                        -{discount}%
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                        {formatCurrency(deal.savings)} de economia
                      </span>
                    </div>
                  )}

                  {/* Store */}
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STORE_COLORS[deal.storeName] || '#6b7280' }}
                    />
                    <span className="text-xs font-medium" style={{ color: STORE_COLORS[deal.storeName] || '#6b7280' }}>
                      {deal.storeName}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-sm line-clamp-2 mb-3">
                    {deal.productName}
                  </h3>

                  {/* Category */}
                  {deal.category && (
                    <div className="flex items-center gap-1 mb-3">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{deal.category}</span>
                    </div>
                  )}

                  {/* Prices */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(deal.dealPrice)}
                    </span>
                    {deal.originalPrice > deal.dealPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(deal.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {deal.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a href={deal.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver Oferta
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
