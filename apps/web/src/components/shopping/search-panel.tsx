'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ShoppingBag, Heart, ExternalLink, TrendingDown, Filter, X, Check, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useAddToWishlist, useWishlist } from '@/hooks/api/use-shopping';
import { toast } from 'sonner';
import { ProductDetailPanel } from './product-detail-panel';
import { STORES, type StoreId } from '@/lib/shopping/stores';

const ALL_STORES = 'all';

interface SearchResult {
  id: string;
  name: string;
  store: string;
  price: number;
  original_price: number;
  url: string;
  imageUrl?: string;
  rating?: number;
  condition?: string;
  brand?: string;
}

function extractMeta(title: string): { condition: string; brand: string } {
  const lower = title.toLowerCase();
  let condition = 'Novo';
  if (lower.includes('seminovo') || lower.includes('semi-novo')) condition = 'Seminovo';
  else if (lower.includes('usado') || lower.includes('recondicionado')) condition = 'Usado';
  
  const brands = ['Asus', 'Lenovo', 'HP', 'Dell', 'Samsung', 'Acer', 'Apple', 'Microsoft', 'Huawei', 'Xiaomi', 'Positivo', 'Multilaser', 'Avell', 'Msi', 'Gigabyte', 'Nvidia', 'Razer'];
  const brand = brands.find(b => lower.includes(b.toLowerCase())) || '';
  return { condition, brand };
}

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [selectedStore, setSelectedStore] = React.useState<StoreId | 'all'>(ALL_STORES);
  const [products, setProducts] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [storeProgress, setStoreProgress] = React.useState<Record<string, 'pending' | 'loading' | 'done' | 'error'>>({});
  const [filterCondition, setFilterCondition] = React.useState('all');
  const [filterBrand, setFilterBrand] = React.useState('all');
  const [selectedProduct, setSelectedProduct] = React.useState<SearchResult | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = React.useState(false);

  const { data: wishlistData } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const wishlistItems = React.useMemo(() => {
    if (!wishlistData) return [];
    return wishlistData.items || [];
  }, [wishlistData]);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-search on debounced query change
  React.useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, selectedStore]);

  const handleSearch = React.useCallback(async (query: string) => {
    if (!query) return;
    setSearching(true);
    setProducts([]);
    
    const storesToSearch = selectedStore === ALL_STORES
      ? (Object.keys(STORES) as StoreId[])
      : [selectedStore];
    
    // Initialize progress for all stores
    const initialProgress: Record<string, 'pending' | 'loading' | 'done' | 'error'> = {};
    storesToSearch.forEach(s => { initialProgress[s] = 'pending'; });
    setStoreProgress(initialProgress);

    const allProducts: SearchResult[] = [];
    
    // Scrape stores in parallel with progress tracking
    const scrapeStore = async (storeId: StoreId) => {
      const store = STORES[storeId];
      setStoreProgress(prev => ({ ...prev, [storeId]: 'loading' }));
      
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&store=${storeId}`, {
          signal: AbortSignal.timeout(60000),
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const storeProducts = (data.products || []).map((item: any) => {
          const meta = extractMeta(item.title || '');
          return {
            id: item.id || `${storeId}-${Date.now()}-${Math.random()}`,
            name: item.title || query,
            store: store.name,
            price: Number(item.price) || 0,
            original_price: Number(item.originalPrice) || Number(item.price) || 0,
            url: item.url || '',
            imageUrl: item.imageUrl || '',
            rating: item.rating,
            condition: meta.condition,
            brand: meta.brand,
          };
        }).filter((p: SearchResult) => p.price > 0 && p.url && p.url.length > 5);
        
        allProducts.push(...storeProducts);
        setProducts([...allProducts].sort((a, b) => a.price - b.price));
        setStoreProgress(prev => ({ ...prev, [storeId]: 'done' }));
      } catch (error) {
        console.error(`[search] Error scraping ${storeId}:`, error);
        setStoreProgress(prev => ({ ...prev, [storeId]: 'error' }));
      }
    };

    // Run all scrapers in parallel
    await Promise.allSettled(storesToSearch.map(scrapeStore));
    
    // Final dedup and sort
    const seen = new Set<string>();
    const deduped = allProducts.filter(p => {
      const key = `${p.name.toLowerCase().substring(0, 30)}-${p.store}-${p.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    deduped.sort((a, b) => a.price - b.price);
    setProducts(deduped);
    setSearching(false);
  }, [selectedStore]);

  const handleAddToWishlist = (product: SearchResult) => {
    addToWishlist.mutate(
      {
        name: product.name,
        store: product.store,
        current_price: product.price,
        url: product.url,
        image_url: product.imageUrl,
      },
      {
        onSuccess: () => {
          toast.success('Adicionado à wishlist!');
        },
        onError: () => {
          toast.error('Erro ao adicionar à wishlist');
        },
      }
    );
  };

  const filteredProducts = products.filter(p => {
    if (filterCondition !== 'all' && p.condition !== filterCondition) return false;
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
    return true;
  });

  const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const availableConditions = [...new Set(products.map(p => p.condition).filter(Boolean))].sort();
  const cheapest = filteredProducts.length > 0 ? filteredProducts[0] : null;

  const activeStoresCount = Object.values(storeProgress).filter(s => s === 'loading').length;
  const completedStoresCount = Object.values(storeProgress).filter(s => s === 'done').length;
  const totalStores = Object.keys(storeProgress).length;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar produto em todas as lojas..."
            onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
            className="pl-9"
          />
        </div>
        <Button 
          onClick={() => handleSearch(searchQuery)} 
          disabled={searching || !searchQuery}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white min-w-[120px]"
        >
          {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {searching ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {/* Store Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStore(ALL_STORES)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedStore === ALL_STORES
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Todas as Lojas
        </button>
        {(Object.entries(STORES) as [StoreId, typeof STORES[StoreId]][]).map(([id, store]) => (
          <button
            key={id}
            onClick={() => setSelectedStore(id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedStore === id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: store.color }}
            />
            {store.name}
          </button>
        ))}
      </div>

      {/* Search Progress */}
      {searching && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-border/50 bg-card/80 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Buscando em {totalStores} lojas...
            </span>
            <span className="text-xs text-muted-foreground">
              {completedStoresCount}/{totalStores} concluídas
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedStoresCount / totalStores) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Store Status */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(storeProgress) as [StoreId, string][]).map(([storeId, status]) => {
              const store = STORES[storeId];
              return (
                <div
                  key={storeId}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                    status === 'loading' ? 'bg-primary/10 text-primary' :
                    status === 'done' ? 'bg-success/10 text-success' :
                    status === 'error' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {status === 'done' && <Check className="h-3 w-3" />}
                  {status === 'error' && <X className="h-3 w-3" />}
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: store.color }}
                  />
                  {store.name}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {!searching && products.length > 0 && (availableBrands.length > 1 || availableConditions.length > 1) && (
        <div className="flex items-center gap-4 flex-wrap">
          {availableConditions.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Condição:</span>
              {['all', ...availableConditions].filter(Boolean).map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCondition(c || 'all')}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    filterCondition === c 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {c === 'all' ? 'Todos' : c}
                </button>
              ))}
            </div>
          )}
          {availableBrands.length > 1 && (
            <div className="flex items-center gap-2">
              <Store className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Marca:</span>
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="all">Todas</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searching && searchQuery && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border/50 bg-card/80 p-8 text-center"
        >
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-muted-foreground">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Tente buscar por outro termo</p>
        </motion.div>
      )}

      {/* Best Deal Banner */}
      {!searching && cheapest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Melhor Preço Encontrado</p>
              <p className="text-lg font-bold">{cheapest.name.substring(0, 60)}</p>
              <p className="text-sm text-muted-foreground">em {cheapest.store}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{formatCurrency(cheapest.price)}</p>
              {cheapest.url && (
                <a 
                  href={cheapest.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-primary hover:underline flex items-center gap-1 justify-end mt-1"
                >
                  Ver na loja <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      {!searching && filteredProducts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredProducts.map((product, idx) => {
            const isBest = idx === 0;
            const discount = product.original_price > product.price 
              ? Math.round((1 - product.price / product.original_price) * 100) 
              : 0;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`rounded-xl border border-border/50 bg-card/80 p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                  isBest ? 'border-green-500/30 bg-green-500/5' : ''
                }`}
                onClick={() => { setSelectedProduct(product); setDetailPanelOpen(true); }}
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STORES[product.store as StoreId]?.color || '#6b7280' }}
                      />
                      <p className="text-xs text-muted-foreground">{product.store}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {discount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-bold">
                          -{discount}%
                        </span>
                      )}
                      {product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.original_price)}
                        </span>
                      )}
                      <span className={`font-bold ${isBest ? 'text-green-600' : 'text-primary'}`}>
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAddToWishlist(product); }}
                    className="text-xs flex-1"
                  >
                    <Heart className="h-3 w-3 mr-1" /> Wishlist
                  </Button>
                  {product.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={product.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Loja
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        isOpen={detailPanelOpen}
        onClose={() => { setDetailPanelOpen(false); setSelectedProduct(null); }}
        onAddToWishlist={(product) => {
          handleAddToWishlist(product as SearchResult);
          setDetailPanelOpen(false);
        }}
      />
    </div>
  );
}
