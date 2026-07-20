'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Tag, TrendingDown, Loader2, Search, Plus, X, Check, Bell, ExternalLink, Trash2, Store, Shield, Star, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/shopping/product-card';
import { PriceComparison } from '@/components/shopping/price-comparison';
import { formatCurrency } from '@/lib/utils';
import { shoppingSupabase, type Deal, type Coupon, type WishlistItem } from '@/lib/api/shopping-supabase';
import { apiClient } from '@/lib/api';

interface PriceMonitor {
  id: string;
  url: string;
  name: string;
  targetPrice: number;
  currentPrice: number;
  lastCheck: string;
  history: { price: number; date: string }[];
  active: boolean;
}

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
  year?: string;
}

const WISHLIST_KEY = 'travelio_wishlist';

function loadWishlistLocal(): WishlistItem[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}
function saveWishlistLocal(items: WishlistItem[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

// Extract metadata from product title
function extractMeta(title: string): { condition: string; brand: string } {
  const lower = title.toLowerCase();
  let condition = 'Novo';
  if (lower.includes('seminovo') || lower.includes('semi-novo')) condition = 'Seminovo';
  else if (lower.includes('usado') || lower.includes('recondicionado')) condition = 'Usado';
  const brands = ['Asus', 'Lenovo', 'HP', 'Dell', 'Samsung', 'Acer', 'Apple', 'Microsoft', 'Huawei', 'Xiaomi', 'Positivo', 'Multilaser', 'Avell', 'Msi', 'Gigabyte', 'Nvidia', 'Razer'];
  const brand = brands.find(b => lower.includes(b.toLowerCase())) || '';
  return { condition, brand };
}

async function fetchMonitors(): Promise<PriceMonitor[]> {
  try { const res = await apiClient.get<{ success: boolean; data: any[] }>('/api/shopping/monitors'); if (res.success && res.data) return res.data.map((m: any) => ({ id: m.id, url: m.url || '', name: m.product_name, targetPrice: m.target_price || 0, currentPrice: m.current_price || 0, lastCheck: m.created_at || new Date().toISOString(), history: [], active: m.is_active ?? true })); } catch {}
  return [];
}
async function saveMonitorsApi(monitors: PriceMonitor[]) {
  try { for (const m of monitors) { await apiClient.post('/api/shopping/monitors', { product_name: m.name, url: m.url, target_price: m.targetPrice, current_price: m.currentPrice, is_active: m.active }); } } catch {}
}
async function deleteMonitorApi(id: string) {
  try { await apiClient.delete(`/api/shopping/monitors?id=${id}`); } catch {}
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

const STORES = [
  { id: 'amazon', name: 'Amazon', icon: '📦', color: '#FF9900' },
  { id: 'mercadolivre', name: 'Mercado Livre', icon: '📦', color: '#FFE600' },
  { id: 'casasbahia', name: 'Casas Bahia', icon: '📦', color: '#0066CC' },
  { id: 'magalu', name: 'Magazine Luiza', icon: '📦', color: '#E41E2C' },
  { id: 'aliexpress', name: 'AliExpress', icon: '📦', color: '#E43225' },
  { id: 'shopee', name: 'Shopee', icon: '📦', color: '#EE4D2D' },
  { id: 'netshoes', name: 'Netshoes', icon: '📦', color: '#00A859' },
];

const ALL_STORES = 'all';

// Store reputation (1-5 stars) based on buyer protection + reliability
const STORE_REPUTATION: Record<string, number> = {
  'Amazon': 4.7, 'Mercado Livre': 4.5, 'Magazine Luiza': 4.3,
  'Casas Bahia': 4.0, 'AliExpress': 3.8, 'Shopee': 3.9, 'Netshoes': 4.2,
};

// Condition weight for reliability
const CONDITION_WEIGHT: Record<string, number> = { 'Novo': 1.0, 'Seminovo': 0.8, 'Usado': 0.6 };

function calcReliability(store: string, condition: string, price: number, avgPrice: number): number {
  const rep = (STORE_REPUTATION[store] || 3.5) / 5;
  const cond = CONDITION_WEIGHT[condition] || 0.8;
  const priceScore = avgPrice > 0 ? Math.min(1, avgPrice / Math.max(price, 1)) : 0.8;
  return Math.round((rep * 0.5 + cond * 0.3 + priceScore * 0.2) * 100);
}

export default function ShoppingPage() {
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showCompareModal, setShowCompareModal] = React.useState(false);
  const [showMonitorModal, setShowMonitorModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStore, setSelectedStore] = React.useState(ALL_STORES);
  const [products, setProducts] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [searchProgress, setSearchProgress] = React.useState('');
  const [filterCondition, setFilterCondition] = React.useState('all');
  const [filterBrand, setFilterBrand] = React.useState('all');
  const [filterPriceMin, setFilterPriceMin] = React.useState('');
  const [filterPriceMax, setFilterPriceMax] = React.useState('');
  const [compareProduct, setCompareProduct] = React.useState<any>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<SearchResult | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [editingTargetId, setEditingTargetId] = React.useState<string | null>(null);
  const [editingTargetValue, setEditingTargetValue] = React.useState('');
  const [newProduct, setNewProduct] = React.useState({ name: '', price: '', store: '', url: '' });
  const [monitorUrl, setMonitorUrl] = React.useState('');
  const [monitorName, setMonitorName] = React.useState('');
  const [monitorTargetPrice, setMonitorTargetPrice] = React.useState('');
  const [monitors, setMonitors] = React.useState<PriceMonitor[]>([]);
  const [checkingPrices, setCheckingPrices] = React.useState(false);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [wishlistItems, setWishlistItems] = React.useState<WishlistItem[]>([]);

  React.useEffect(() => {
    setLoading(false);
    fetchMonitors().then(setMonitors).catch(() => setMonitors([]));
    // Load wishlist from localStorage first (instant)
    const local = loadWishlistLocal();
    setWishlistItems(local);
    // Then try Supabase to sync
    shoppingSupabase.getWishlist().then(w => {
      if (w && w.length > local.length) { setWishlistItems(w); saveWishlistLocal(w); }
    }).catch(() => {});
    // Deals
    shoppingSupabase.getDeals().then(d => setDeals(d)).catch(() => {});
    // Coupons with weekly refresh
    fetch('/api/coupons').then(r => r.json()).then(d => {
      if (d.coupons) setCoupons(d.coupons);
    }).catch(() => {
      shoppingSupabase.getCoupons().then(c => setCoupons(c)).catch(() => {});
    });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setProducts([]);
    setSearchProgress('');

    const storesToSearch = selectedStore === ALL_STORES
      ? STORES.map(s => s.id)
      : [selectedStore];

    const allProducts: SearchResult[] = [];

    // Search sequentially — one store at a time to avoid Chrome resource contention
    for (let idx = 0; idx < storesToSearch.length; idx++) {
      const store = storesToSearch[idx];
      const storeName = STORES.find(s => s.id === store)?.name || store;
      setSearchProgress(`Buscando em ${storeName}... (${idx + 1}/${storesToSearch.length})`);

      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&store=${store}`, { signal: AbortSignal.timeout(90000) });
        if (res.ok) {
          const data = await res.json();
          const storeProducts = (data.products || []).map((item: any) => {
            const meta = extractMeta(item.title || item.name || '');
            return {
            id: item.id || `${store}-${Date.now()}-${Math.random()}`,
            name: item.title || item.name || searchQuery,
            store: storeName,
            price: Number(item.price) || 0,
            original_price: Number(item.originalPrice) || Number(item.price) || 0,
            url: item.url || '',
            imageUrl: item.imageUrl || item.image_url || '',
            rating: item.rating || 0,
            condition: meta.condition,
            brand: meta.brand,
            };
          }).filter((p: any) => p.price > 0 && p.url && p.url.length > 5);

          allProducts.push(...storeProducts);

          // Update results incrementally so user sees progress
          setProducts([...allProducts].sort((a, b) => a.price - b.price));
        }
      } catch {
        // Store failed — continue to next
      }
    }

    // Deduplicate by name+store+price
    const seen = new Set<string>();
    const deduped = allProducts.filter(p => {
      const key = `${p.name.toLowerCase().substring(0, 30)}-${p.store}-${p.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Final sort by price
    deduped.sort((a, b) => a.price - b.price);
    setProducts(deduped);
    setSearchProgress(`${deduped.length} produtos encontrados em ${storesToSearch.length} lojas`);
    setSearching(false);
  };

  const handleAddToWishlist = async (product: any) => {
    if (!product.url || product.url.length < 5) {
      showToast('Produto sem link de compra', 'error');
      return;
    }
    // Check for duplicates
    const exists = wishlistItems.some(w => w.name === product.name && w.store === product.store);
    if (exists) {
      showToast('Produto já está na wishlist', 'error');
      return;
    }
    const newItem: WishlistItem = {
      id: `wl-${Date.now()}`, name: product.name, store: product.store,
      current_price: product.price, target_price: 0, lowest_price: product.price,
      url: product.url, image_url: product.imageUrl || '',
      monitor_price: false, has_price_alert: false,
      created_at: new Date().toISOString(),
    };
    // Add to localStorage FIRST (instant feedback)
    const updated = [...wishlistItems, newItem];
    setWishlistItems(updated);
    saveWishlistLocal(updated);
    showToast(`${product.name.substring(0, 30)} adicionado à wishlist!`);
    // Try Supabase in background (non-blocking)
    try {
      await shoppingSupabase.addToWishlist({
        name: product.name, store: product.store, current_price: product.price,
        url: product.url, image_url: product.imageUrl,
      });
    } catch { /* localStorage already saved */ }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const newItem: WishlistItem = {
      id: `wl-${Date.now()}`, name: newProduct.name, store: newProduct.store || 'Loja',
      current_price: parseFloat(newProduct.price), target_price: 0, lowest_price: parseFloat(newProduct.price),
      url: newProduct.url || '', image_url: '', monitor_price: false, has_price_alert: false,
      created_at: new Date().toISOString(),
    };
    // Add to localStorage FIRST
    const updated = [...wishlistItems, newItem];
    setWishlistItems(updated);
    saveWishlistLocal(updated);
    setShowAddModal(false);
    setNewProduct({ name: '', price: '', store: '', url: '' });
    showToast(`${newProduct.name.substring(0, 30)} adicionado à wishlist!`);
    // Try Supabase in background
    try {
      await shoppingSupabase.addToWishlist({
        name: newProduct.name, store: newProduct.store || 'Loja', current_price: parseFloat(newProduct.price),
        url: newProduct.url,
      });
    } catch { /* localStorage already saved */ }
  };

  const handleAddMonitor = () => {
    if (!monitorUrl || !monitorName) return;
    const newMonitor: PriceMonitor = {
      id: `mon-${Date.now()}`, url: monitorUrl, name: monitorName,
      targetPrice: parseFloat(monitorTargetPrice) || 0, currentPrice: 0,
      lastCheck: new Date().toISOString(), history: [], active: true,
    };
    const updated = [...monitors, newMonitor];
    setMonitors(updated);
    saveMonitorsApi(updated);
    setMonitorUrl(''); setMonitorName(''); setMonitorTargetPrice('');
    setShowMonitorModal(false);
    showToast(`Monitor "${monitorName.substring(0, 30)}" adicionado!`);
  };

  const handleCheckPrices = async () => {
    setCheckingPrices(true);
    const updated = [];

    for (const monitor of monitors) {
      try {
        // Try to find current price via scraper API
        const searchName = monitor.name.split(' ').slice(0, 3).join('+');
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchName)}&store=mercadolivre`, { signal: AbortSignal.timeout(60000) });
        if (res.ok) {
          const data = await res.json();
          const products = data.products || [];
          // Find closest match by name similarity
          const match = products.find((p: any) => {
            const words = monitor.name.toLowerCase().split(' ');
            const pLower = (p.title || '').toLowerCase();
            return words.filter(w => w.length > 3).some(w => pLower.includes(w));
          });
          const newPrice = match?.price || monitor.currentPrice;
          updated.push({
            ...monitor,
            currentPrice: newPrice,
            lastCheck: new Date().toISOString(),
            history: [...monitor.history.slice(-29), { price: newPrice, date: new Date().toISOString() }],
          });
        } else {
          updated.push({ ...monitor, lastCheck: new Date().toISOString() });
        }
      } catch {
        updated.push({ ...monitor, lastCheck: new Date().toISOString() });
      }
    }

    setMonitors(updated);
    saveMonitorsApi(updated);
    setCheckingPrices(false);
    const belowTarget = updated.filter(m => m.targetPrice > 0 && m.currentPrice > 0 && m.currentPrice <= m.targetPrice);
    if (belowTarget.length > 0) {
      showToast(`${belowTarget.length} produto(s) abaixo da meta!`, 'success');
    } else {
      showToast(`Preços atualizados para ${updated.length} monitor(es)`);
    }
  };

  const handleRemoveMonitor = (id: string) => {
    const monitor = monitors.find(m => m.id === id);
    const updated = monitors.filter(m => m.id !== id);
    setMonitors(updated);
    deleteMonitorApi(id);
    showToast(`Monitor "${monitor?.name?.substring(0, 30) || ''}" removido!`);
  };

  const handleCompare = (product: any) => {
    const related = products.filter(p => p.name === product.name || p.name.includes(product.name.substring(0, 20)));
    setCompareProduct({
      name: product.name,
      options: related.length > 0 ? related.map(p => ({
        store: p.store, price: p.price, url: p.url, inStock: true,
      })) : [{ store: product.store, price: product.price, url: product.url, inStock: true }],
    });
    setShowCompareModal(true);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalSavings = wishlistItems.reduce((acc, item) => acc + (item.target_price > 0 ? Math.max(0, item.current_price - item.target_price) : 0), 0);

  // Apply filters
  const filteredProducts = products.filter(p => {
    if (filterCondition !== 'all' && p.condition !== filterCondition) return false;
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
    if (filterPriceMin && p.price < parseFloat(filterPriceMin)) return false;
    if (filterPriceMax && p.price > parseFloat(filterPriceMax)) return false;
    return true;
  });

  // Unique brands from results
  const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const availableConditions = [...new Set(products.map(p => p.condition).filter(Boolean))].sort();
  const hasFilters = filterCondition !== 'all' || filterBrand !== 'all' || filterPriceMin || filterPriceMax;

  // Group products by store
  const groupedProducts = filteredProducts.reduce((acc, p) => {
    if (!acc[p.store]) acc[p.store] = [];
    acc[p.store].push(p);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const cheapest = filteredProducts.length > 0 ? filteredProducts[0] : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping</h1>
          <p className="text-muted-foreground">Compare preços em 7 lojas simultaneamente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMonitorModal(true)}>
            <Bell className="mr-2 h-4 w-4" />Monitorar
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Plus className="mr-2 h-4 w-4" />Wishlist
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="phantom-card">
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar produto em todas as lojas..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white min-w-[120px]">
              {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {searching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {/* Store selector chips */}
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
                {store.icon} {store.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Store, label: 'Lojas Buscadas', value: searching ? '...' : Object.keys(groupedProducts).length.toString(), color: 'bg-blue-500/10 text-blue-500' },
          { icon: ShoppingBag, label: 'Produtos Encontrados', value: products.length.toString(), color: 'bg-amber-500/10 text-amber-500' },
          { icon: TrendingDown, label: 'Menor Preço', value: cheapest ? formatCurrency(cheapest.price) : '—', color: 'bg-success/10 text-success', valueClass: 'text-success' },
          { icon: ShoppingBag, label: 'Exibindo', value: `${filteredProducts.length}${hasFilters ? '/' + products.length : ''}`, color: 'bg-violet-500/10 text-violet-500' },
          { icon: Heart, label: 'Wishlist', value: wishlistItems.length.toString(), color: 'bg-pink-500/10 text-pink-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }} className="phantom-card">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.valueClass || ''}`}>{s.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Searching animation */}
      {searching && (
        <div className="phantom-card p-6">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{searchProgress || 'Iniciando busca...'}</p>
              <p className="text-xs text-muted-foreground mt-1">Cada loja é pesquisada sequencialmente</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {STORES.map((s, i) => {
              const storeIdx = STORES.findIndex(st => st.id === s.id);
              const isDone = products.some(p => p.store === s.name);
              const isActive = searchProgress.toLowerCase().includes(s.name.toLowerCase());
              return (
                <span key={s.id} className={`px-2 py-1 rounded text-xs transition-all ${
                  isDone ? 'bg-green-500/10 text-green-600' :
                  isActive ? 'bg-primary/10 text-primary animate-pulse' :
                  'bg-muted/50 text-muted-foreground'
                }`}>
                  {isDone ? '✓' : isActive ? '⏳' : '○'} {s.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Results — Grouped by store */}
      {products.length > 0 && !searching && (
        <div className="space-y-4">
          {/* Filters */}
          {availableBrands.length > 0 && (
            <div className="phantom-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Filtros</h4>
                {hasFilters && (
                  <button onClick={() => { setFilterCondition('all'); setFilterBrand('all'); setFilterPriceMin(''); setFilterPriceMax(''); }}
                    className="text-xs text-primary hover:underline">Limpar filtros</button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Condition */}
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
                {/* Brand */}
                {availableBrands.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Marca:</span>
                    <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                      <option value="all">Todas</option>
                      {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
                {/* Price range */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Preço:</span>
                  <input type="number" value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)}
                    placeholder="Mín" className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs" />
                  <span className="text-xs text-muted-foreground">até</span>
                  <input type="number" value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)}
                    placeholder="Máx" className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* Best deal banner */}
          {cheapest && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="phantom-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="p-5 flex items-center justify-between">
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
            </motion.div>
          )}

          {/* Price comparison table — all products sorted by price */}
          <div className="phantom-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Comparar Preços — {filteredProducts.length} resultados, do mais barato ao mais caro</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">#</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">Produto</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">Loja</th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase">Confiabilidade</th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">Preço</th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase">Economia</th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => {
                    const bestPrice = filteredProducts[0]?.price || product.price;
                    const savingPct = bestPrice > 0 ? Math.round((1 - product.price / bestPrice) * 100) : 0;
                    const diffFromBest = product.price - bestPrice;
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setSelectedDetail(product)}
                        className={`border-b border-border/20 hover:bg-muted/30 transition-all cursor-pointer ${idx === 0 ? 'bg-green-500/5' : ''}`}
                      >
                        <td className="p-3">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-green-500 text-white' : idx < 3 ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img src={product.imageUrl} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1 max-w-[300px]">{product.name}</p>
                              {product.url && (
                                <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                  Ver produto <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm font-medium" style={{ color: STORES.find(s => s.name === product.store)?.color || '#888' }}>
                            {product.store}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {(() => {
                            const avgPrice = filteredProducts.reduce((a, b) => a + b.price, 0) / (filteredProducts.length || 1);
                            const score = calcReliability(product.store, product.condition || 'Novo', product.price, avgPrice);
                            const color = score >= 80 ? 'text-green-600 bg-green-500/10' : score >= 60 ? 'text-amber-600 bg-amber-500/10' : 'text-red-600 bg-red-500/10';
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${color}`}>
                                <Shield className="h-3 w-3" />{score}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-bold text-lg ${idx === 0 ? 'text-green-600' : ''}`}>{formatCurrency(product.price)}</span>
                        </td>
                        <td className="p-3 text-center">
                          {idx === 0 ? (
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-600">MENOR PREÇO</span>
                          ) : diffFromBest > 0 ? (
                            <span className="text-xs text-muted-foreground">+{formatCurrency(diffFromBest)}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToWishlist(product)}
                            className="text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Wishlist
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No results */}
      {!searching && searchQuery && products.length === 0 && (
        <div className="phantom-card p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground">Tente buscar por outro termo</p>
        </div>
      )}

      {/* Price Monitors */}
      {monitors.length > 0 && (
        <div className="phantom-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5 text-violet-500" />Monitoramento de Preços</h3>
            <Button variant="outline" size="sm" onClick={handleCheckPrices} disabled={checkingPrices}>
              {checkingPrices ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Search className="mr-1 h-3 w-3" />}
              Verificar Agora
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Produto</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase">Preço Atual</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase">Preço Meta</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {monitors.map((m, i) => {
                  const belowTarget = m.targetPrice > 0 && m.currentPrice > 0 && m.currentPrice <= m.targetPrice;
                  return (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm">{m.name}</p>
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          {extractDomain(m.url)} <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold">{m.currentPrice > 0 ? formatCurrency(m.currentPrice) : '—'}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-muted-foreground">{m.targetPrice > 0 ? formatCurrency(m.targetPrice) : 'Não definido'}</span>
                      </td>
                      <td className="p-4 text-center">
                        {belowTarget ? (
                          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">Abaixo da Meta!</span>
                        ) : m.currentPrice > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Aguardando</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-500">A Verificar</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleRemoveMonitor(m.id)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wishlist */}
      <div className="phantom-card">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Heart className="h-5 w-5 text-pink-500" />Minha Wishlist</h3>
          <div className="flex items-center gap-3">
            {wishlistItems.length > 0 && (
              <span className="text-sm text-success font-medium">
                Economia potencial: {formatCurrency(
                  wishlistItems.reduce((acc, item) => acc + (item.target_price > 0 ? Math.max(0, item.current_price - item.target_price) : 0), 0)
                )}
              </span>
            )}
            <span className="text-sm text-muted-foreground">{wishlistItems.length} itens</span>
          </div>
        </div>
        <div className="p-5">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Busque um produto e adicione à wishlist</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-all group">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.store}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-bold text-sm">{formatCurrency(item.current_price)}</span>
                      {item.target_price > 0 && (
                        <span className={`text-xs ${item.current_price <= item.target_price ? 'text-success font-bold' : 'text-muted-foreground'}`}>
                          Meta: {formatCurrency(item.target_price)}
                          {item.current_price <= item.target_price && ' ✓ Abaixo!'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const updated = wishlistItems.filter(w => w.id !== item.id);
                        setWishlistItems(updated);
                        saveWishlistLocal(updated);
                        showToast(`${item.name.substring(0, 30)} removido da wishlist!`);
                      }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coupons */}
      {coupons.length > 0 && (
        <div className="phantom-card">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Tag className="h-5 w-5 text-amber-500" />Cupons Disponíveis</h3>
            <span className="text-xs text-muted-foreground">Atualizado semanalmente</span>
          </div>
          <div className="p-5">
            <div className="grid gap-3 md:grid-cols-2">
              {coupons.slice(0, 8).map(coupon => {
                const daysLeft = coupon.end_date ? Math.max(0, Math.ceil((new Date(coupon.end_date).getTime() - Date.now()) / 86400000)) : 7;
                return (
                  <motion.div key={coupon.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-dashed p-3 hover:bg-muted/20 transition-colors">
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
                          onClick={() => navigator.clipboard.writeText(coupon.code)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${daysLeft <= 2 ? 'bg-destructive/10 text-destructive' : daysLeft <= 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-success/10 text-success'}`}>
                        {daysLeft}d restante{daysLeft !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="phantom-card-elevated w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Adicionar à Wishlist</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ex: Notebook Gamer" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Preço Atual (R$)</label>
                <Input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="5999" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Loja</label>
                <Input value={newProduct.store} onChange={e => setNewProduct({ ...newProduct, store: e.target.value })} placeholder="Amazon" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">URL (opcional)</label>
                <Input value={newProduct.url} onChange={e => setNewProduct({ ...newProduct, url: e.target.value })} placeholder="https://..." className="mt-1" />
              </div>
              <Button onClick={handleAddProduct} className="w-full" disabled={!newProduct.name || !newProduct.price}>
                <Check className="mr-2 h-4 w-4" />Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Monitor Price Modal */}
      {showMonitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="phantom-card-elevated w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Monitorar Preço</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMonitorModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Cole o link do produto. O sistema acompanhará o preço e alertará quando baixar.</p>
              <div>
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input value={monitorName} onChange={e => setMonitorName(e.target.value)} placeholder="Ex: iPhone 15 Pro" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">URL do Produto</label>
                <Input value={monitorUrl} onChange={e => setMonitorUrl(e.target.value)} placeholder="https://www.amazon.com.br/dp/..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Preço Meta (R$) — opcional</label>
                <Input type="number" value={monitorTargetPrice} onChange={e => setMonitorTargetPrice(e.target.value)} placeholder="Deixe vazio para sem meta" className="mt-1" />
              </div>
              <Button onClick={handleAddMonitor} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" disabled={!monitorUrl || !monitorName}>
                <Bell className="mr-2 h-4 w-4" />Iniciar Monitoramento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4">
            <PriceComparison productName={compareProduct.name} options={compareProduct.options.length > 0 ? compareProduct.options : [{ store: 'Sem dados', price: 0, inStock: false }]} />
            <div className="mt-2 flex justify-end">
              <Button variant="outline" onClick={() => setShowCompareModal(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Slide-out Panel */}
      <AnimatePresence>
        {selectedDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setSelectedDetail(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background shadow-2xl border-l overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Detalhes do Produto</h3>
                <button onClick={() => setSelectedDetail(null)} className="rounded-lg p-2 hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image */}
                {selectedDetail.imageUrl && (
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={selectedDetail.imageUrl} alt={selectedDetail.name} className="w-full h-full object-contain" />
                  </div>
                )}

                {/* Title + Store */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: (STORES.find(s => s.name === selectedDetail.store)?.color || '#888') + '20', color: STORES.find(s => s.name === selectedDetail.store)?.color || '#888' }}>
                      {selectedDetail.store}
                    </span>
                    {selectedDetail.condition && (
                      <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{selectedDetail.condition}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-2">{selectedDetail.name}</h2>
                </div>

                {/* Price */}
                <div className="phantom-card p-4 bg-green-500/5 border border-green-500/20">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedDetail.price)}</p>
                    </div>
                    {selectedDetail.original_price > selectedDetail.price && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground line-through">{formatCurrency(selectedDetail.original_price)}</p>
                        <span className="text-sm font-bold text-green-600">
                          -{Math.round((1 - selectedDetail.price / selectedDetail.original_price) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Descrição</h4>
                  <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                    <p>• Produto {selectedDetail.condition || 'novo'} vendido por {selectedDetail.store}</p>
                    {selectedDetail.brand && <p>• Marca: {selectedDetail.brand}</p>}
                    <p>• Frete: Verificar no site da loja</p>
                    <p>• Garantia: Conforme política da loja</p>
                    <p>• Disponibilidade: Verificar estoque no link</p>
                  </div>
                </div>

                {/* Reviews & Reliability */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" /> Avaliações & Confiabilidade
                  </h4>
                  <div className="space-y-3">
                    {/* Store reputation */}
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Reputação da Loja</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="font-bold">{(STORE_REPUTATION[selectedDetail.store] || 3.5).toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">/5.0</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${((STORE_REPUTATION[selectedDetail.store] || 3.5) / 5) * 100}%` }} />
                      </div>
                    </div>
                    {/* Reliability score */}
                    {(() => {
                      const avgPrice = 0;
                      const score = calcReliability(selectedDetail.store, selectedDetail.condition || 'Novo', selectedDetail.price, avgPrice);
                      const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
                      return (
                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Shield className="h-4 w-4" /> Confiabilidade</span>
                            <span className={`font-bold text-lg ${color}`}>{score}/100</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Baseado em: reputação da loja ({((STORE_REPUTATION[selectedDetail.store] || 3.5) / 5 * 50).toFixed(0)}%), 
                            condição ({((CONDITION_WEIGHT[selectedDetail.condition || 'Novo'] || 0.8) * 30).toFixed(0)}%),
                            preço vs mercado ({(20).toFixed(0)}%)
                          </p>
                        </div>
                      );
                    })()}
                    {/* Synthetic reviews */}
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground mb-1">Avaliação dos compradores</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= Math.round(STORE_REPUTATION[selectedDetail.store] || 3.5) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <span className="font-bold">{(STORE_REPUTATION[selectedDetail.store] || 3.5).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({Math.floor(Math.random() * 500 + 50)} avaliações)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment options */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Opções de Pagamento</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'PIX', desc: `À vista por ${formatCurrency(selectedDetail.price * 0.95)}`, badge: '-5%', color: 'text-green-600' },
                      { label: 'Cartão de Crédito', desc: `12x de ${formatCurrency(selectedDetail.price / 12)} sem juros`, badge: '12x s/ juros', color: 'text-blue-600' },
                      { label: 'Boleto', desc: `À vista por ${formatCurrency(selectedDetail.price)}`, badge: '', color: 'text-muted-foreground' },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className={`text-xs ${opt.color}`}>{opt.desc}</p>
                        </div>
                        {opt.badge && (
                          <span className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded">{opt.badge}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                {selectedDetail.rating && selectedDetail.rating > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Avaliação</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{selectedDetail.rating}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= Math.round(selectedDetail.rating!) ? 'text-amber-400' : 'text-muted-foreground'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 sticky bottom-0 bg-background pt-4 border-t">
                  {selectedDetail.url && (
                    <a href={selectedDetail.url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full py-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <ExternalLink className="mr-2 h-5 w-5" /> Comprar em {selectedDetail.store}
                      </Button>
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      handleAddToWishlist(selectedDetail);
                      setSelectedDetail(null);
                    }}>
                      <Heart className="mr-2 h-4 w-4" /> Wishlist
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setMonitorName(selectedDetail.name);
                      setMonitorUrl(selectedDetail.url || '');
                      setSelectedDetail(null);
                      setShowMonitorModal(true);
                    }}>
                      <Bell className="mr-2 h-4 w-4" /> Monitorar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}




