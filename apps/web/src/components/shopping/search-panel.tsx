'use client';

import * as React from 'react';
import { Search, Loader2, ShoppingBag, Heart, ExternalLink, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useAddToWishlist, useWishlist } from '@/hooks/api/use-shopping';

const STORES = [
  { id: 'amazon', name: 'Amazon', color: '#FF9900' },
  { id: 'mercadolivre', name: 'Mercado Livre', color: '#FFE600' },
  { id: 'casasbahia', name: 'Casas Bahia', color: '#0066CC' },
  { id: 'magalu', name: 'Magazine Luiza', color: '#E41E2C' },
  { id: 'aliexpress', name: 'AliExpress', color: '#E43225' },
  { id: 'shopee', name: 'Shopee', color: '#EE4D2D' },
  { id: 'netshoes', name: 'Netshoes', color: '#00A859' },
];

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
  const [selectedStore, setSelectedStore] = React.useState(ALL_STORES);
  const [products, setProducts] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [searchProgress, setSearchProgress] = React.useState('');
  const [filterCondition, setFilterCondition] = React.useState('all');
  const [filterBrand, setFilterBrand] = React.useState('all');

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

  const handleSearch = React.useCallback(async (query: string) => {
    if (!query) return;
    setSearching(true);
    setProducts([]);
    setSearchProgress('');

    const storesToSearch = selectedStore === ALL_STORES
      ? STORES.map(s => s.id)
      : [selectedStore];

    const allProducts: SearchResult[] = [];

    for (let idx = 0; idx < storesToSearch.length; idx++) {
      const store = storesToSearch[idx];
      const storeName = STORES.find(s => s.id === store)?.name || store;
      setSearchProgress(`Buscando em ${storeName}... (${idx + 1}/${storesToSearch.length})`);

      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&store=${store}`, { signal: AbortSignal.timeout(90000) });
        if (res.ok) {
          const data = await res.json();
          const storeProducts = (data.products || []).map((item: any) => {
            const meta = extractMeta(item.title || item.name || '');
            return {
              id: item.id || `${store}-${Date.now()}-${Math.random()}`,
              name: item.title || item.name || query,
              store: storeName,
              price: Number(item.price) || 0,
              original_price: Number(item.originalPrice) || Number(item.price) || 0,
              url: item.url || '',
              imageUrl: item.imageUrl || item.image_url || '',
              rating: item.rating || 0,
              condition: meta.condition,
              brand: meta.brand,
            };
          }).filter((p: SearchResult) => p.price > 0 && p.url && p.url.length > 5);

          allProducts.push(...storeProducts);
          setProducts([...allProducts].sort((a, b) => a.price - b.price));
        }
      } catch { /* Store failed — continue to next */ }
    }

    const seen = new Set<string>();
    const deduped = allProducts.filter(p => {
      const key = `${p.name.toLowerCase().substring(0, 30)}-${p.store}-${p.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => a.price - b.price);
    setProducts(deduped);
    setSearchProgress(`${deduped.length} produtos encontrados em ${storesToSearch.length} lojas`);
    setSearching(false);
  }, [selectedStore]);

  React.useEffect(() => {
    if (debouncedQuery) handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const filteredProducts = products.filter(p => {
    if (filterCondition !== 'all' && p.condition !== filterCondition) return false;
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
    return true;
  });

  const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const availableConditions = [...new Set(products.map(p => p.condition).filter(Boolean))].sort();
  const cheapest = filteredProducts.length > 0 ? filteredProducts[0] : null;

  const handleAddToWishlist = (product: SearchResult) => {
    addToWishlist.mutate({
      name: product.name,
      store: product.store,
      current_price: product.price,
      url: product.url,
      image_url: product.imageUrl,
    });
  };

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
        <Button onClick={() => handleSearch(searchQuery)} disabled={searching || !searchQuery} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white min-w-[120px]">
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
        {STORES.map(store => (
          <button
            key={store.id}
            onClick={() => setSelectedStore(store.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStore === store.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {searching && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-4">
              <div className="flex gap-4">
                <div className="h-24 w-24 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                  <div className="h-5 w-1/3 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground text-center">{searchProgress}</p>
        </div>
      )}

      {/* Empty State */}
      {!searching && searchQuery && products.length === 0 && (
        <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground">Tente buscar por outro termo</p>
        </div>
      )}

      {/* Results */}
      {!searching && products.length > 0 && (
        <>
          {/* Filters */}
          {availableBrands.length > 1 && (
            <div className="flex items-center gap-4">
              {availableConditions.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Condição:</span>
                  {['all', ...availableConditions].filter(Boolean).map(c => (
                    <button key={c} onClick={() => setFilterCondition(c || 'all')}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${filterCondition === c ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                      {c === 'all' ? 'Todos' : c}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Marca:</span>
                <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                  <option value="all">Todas</option>
                  {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Best Deal Banner */}
          {cheapest && (
            <div className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Melhor Preço Encontrado</p>
                <p className="text-lg font-bold">{cheapest.name.substring(0, 60)}</p>
                <p className="text-sm text-muted-foreground">em {cheapest.store}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(cheapest.price)}</p>
                {cheapest.url && (
                  <a href={cheapest.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 justify-end mt-1">
                    Ver na loja <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {filteredProducts.map((product, idx) => {
              const isBest = idx === 0;
              return (
                <div key={product.id} className={`rounded-xl border border-border/50 bg-card/80 p-4 hover:shadow-lg transition-shadow ${isBest ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                  <div className="flex gap-3">
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ color: STORES.find(s => s.name === product.store)?.color }}>
                        {product.store}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.original_price > product.price && (
                          <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.original_price)}</span>
                        )}
                        <span className={`font-bold ${isBest ? 'text-green-600' : 'text-primary'}`}>{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => handleAddToWishlist(product)} className="text-xs flex-1">
                      <Heart className="h-3 w-3 mr-1" /> Wishlist
                    </Button>
                    {product.url && (
                      <Button variant="ghost" size="sm" asChild className="text-xs">
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> Loja
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
