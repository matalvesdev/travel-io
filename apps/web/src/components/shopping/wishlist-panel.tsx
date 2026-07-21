'use client';

import * as React from 'react';
import { Heart, Trash2, ExternalLink, ShoppingBag, Plus, X, Check, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/api/use-shopping';
import type { ShoppingWishlistItem } from '@/lib/api/shopping';

export function WishlistPanel() {
  const { data: wishlistData, isLoading } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [newItem, setNewItem] = React.useState({ name: '', price: '', store: '', url: '' });

  const items: ShoppingWishlistItem[] = React.useMemo(() => {
    if (!wishlistData) return [];
    return wishlistData.items || [];
  }, [wishlistData]);

  const potentialSavings = React.useMemo(() =>
    items.reduce((acc, item) => acc + (item.target_price > 0 ? Math.max(0, item.current_price - item.target_price) : 0), 0),
    [items]
  );

  const handleAdd = () => {
    if (!newItem.name || !newItem.price) return;
    addToWishlist.mutate({
      name: newItem.name,
      store: newItem.store || 'Loja',
      current_price: parseFloat(newItem.price),
      target_price: 0,
      url: newItem.url,
    }, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewItem({ name: '', price: '', store: '', url: '' });
      },
    });
  };

  const handleDelete = (id: string) => {
    removeFromWishlist.mutate(id, { onSuccess: () => setDeleteConfirmId(null) });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-4">
            <div className="flex gap-3">
              <div className="h-14 w-14 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-pink-500" />
          <span className="text-sm text-muted-foreground">{items.length} itens</span>
          {potentialSavings > 0 && (
            <span className="text-sm text-success font-medium flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Economia potencial: {formatCurrency(potentialSavings)}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
          <Plus className="mr-1 h-3 w-3" /> Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Busque um produto e adicione à wishlist</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/80 p-3 hover:bg-muted/30 transition-all">
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
                      {item.current_price <= item.target_price && ' Abaixo!'}
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
                {deleteConfirmId === item.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(null)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(item.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Adicionar à Wishlist</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div>
              <label className="text-sm font-medium">Nome do Produto</label>
              <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Ex: Notebook Gamer" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Preço Atual (R$)</label>
              <Input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="5999" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Loja</label>
              <Input value={newItem.store} onChange={e => setNewItem({ ...newItem, store: e.target.value })} placeholder="Amazon" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">URL (opcional)</label>
              <Input value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} placeholder="https://..." className="mt-1" />
            </div>
            <Button onClick={handleAdd} className="w-full" disabled={!newItem.name || !newItem.price || addToWishlist.isPending}>
              {addToWishlist.isPending ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Adicionando...</> : <><Check className="mr-2 h-4 w-4" /> Adicionar</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
