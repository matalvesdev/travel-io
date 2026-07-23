'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ExternalLink, ShoppingBag, Plus, X, Check, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist, useUpdateWishlistItem } from '@/hooks/api/use-shopping';
import { toast } from 'sonner';
import type { WishlistItem } from '@/types/shopping';

export function WishlistPanel() {
  const { data: wishlistData, isLoading } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const updateWishlistItem = useUpdateWishlistItem();
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [newItem, setNewItem] = React.useState({ name: '', price: '', store: '', url: '' });
  const [editingTargetId, setEditingTargetId] = React.useState<string | null>(null);
  const [editingTargetValue, setEditingTargetValue] = React.useState('');
  const [checkingPriceId, setCheckingPriceId] = React.useState<string | null>(null);

  const items: WishlistItem[] = React.useMemo(() => {
    if (!wishlistData) return [];
    return wishlistData.items || [];
  }, [wishlistData]);

  const potentialSavings = React.useMemo(() =>
    items.reduce((acc, item) => {
      const current = Number(item.currentPrice) || 0;
      const target = Number(item.targetPrice) || 0;
      return acc + (target > 0 ? Math.max(0, current - target) : 0);
    }, 0),
    [items]
  );

  const handleAdd = () => {
    if (!newItem.name || !newItem.price) return;
    addToWishlist.mutate(
      {
        name: newItem.name,
        store: newItem.store || 'Loja',
        current_price: parseFloat(newItem.price),
        target_price: 0,
        url: newItem.url,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setNewItem({ name: '', price: '', store: '', url: '' });
          toast.success('Adicionado à wishlist!');
        },
        onError: () => {
          toast.error('Erro ao adicionar à wishlist');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    removeFromWishlist.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
        toast.success('Removido da wishlist');
      },
      onError: () => {
        toast.error('Erro ao remover da wishlist');
      },
    });
  };

  const handleSaveTargetPrice = (id: string) => {
    const price = parseFloat(editingTargetValue);
    if (isNaN(price) || price < 0) {
      toast.error('Preço inválido');
      return;
    }
    updateWishlistItem.mutate(
      { id, target_price: price },
      {
        onSuccess: () => {
          toast.success('Meta de preço atualizada!');
          setEditingTargetId(null);
          setEditingTargetValue('');
        },
        onError: () => {
          toast.error('Erro ao atualizar meta');
        },
      }
    );
  };

  const handleCheckPrice = async (item: WishlistItem) => {
    setCheckingPriceId(item.id);
    toast.info('Verificando preço...');
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(item.name)}&store=all`);
      const data = await res.json();
      const products = data.products || [];
      const count = products.length;
      
      if (count > 0) {
        const cheapest = products[0];
        toast.success(`${count} produto(s) encontrado(s). Melhor preço: ${formatCurrency(cheapest.price)}`);
        
        // Update current price
        updateWishlistItem.mutate(
          { id: item.id, current_price: cheapest.price, lowest_price: Math.min(Number(item.lowestPrice) || cheapest.price, cheapest.price) },
          { onSuccess: () => toast.success('Preço atualizado!') }
        );
        
        // Check if below target
        const target = Number(item.targetPrice) || 0;
        if (target > 0 && cheapest.price <= target) {
          toast.success('Abaixo da meta!');
        }
      } else {
        toast.error('Nenhum produto encontrado');
      }
    } catch (error) {
      toast.error('Erro ao verificar preço');
    } finally {
      setCheckingPriceId(null);
    }
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
      {/* Header */}
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
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Plus className="mr-1 h-3 w-3" /> Adicionar
        </Button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border/50 bg-card/80 p-8 text-center"
        >
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground">Busque um produto e adicione à wishlist</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, index) => {
              const current = Number(item.currentPrice) || 0;
              const target = Number(item.targetPrice) || 0;
              const lowest = Number(item.lowestPrice) || 0;
              const isBelowTarget = target > 0 && current > 0 && current <= target;
              const hasDiscount = lowest > 0 && current < lowest;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/80 p-3 hover:bg-muted/30 transition-all"
                >
                  {/* Image */}
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.store}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-bold text-sm">{formatCurrency(current)}</span>
                      
                      {editingTargetId === item.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Meta:</span>
                          <input
                            type="number"
                            value={editingTargetValue}
                            onChange={(e) => setEditingTargetValue(e.target.value)}
                            className="w-20 text-xs border rounded px-1 py-0.5"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTargetPrice(item.id);
                              if (e.key === 'Escape') {
                                setEditingTargetId(null);
                                setEditingTargetValue('');
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSaveTargetPrice(item.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : target > 0 ? (
                        <span
                          className={`text-xs cursor-pointer hover:underline flex items-center gap-1 ${
                            isBelowTarget ? 'text-success font-bold' : 'text-muted-foreground'
                          }`}
                          onClick={() => {
                            setEditingTargetId(item.id);
                            setEditingTargetValue(target.toString());
                          }}
                        >
                          Meta: {formatCurrency(target)}
                          {isBelowTarget && <TrendingDown className="h-3 w-3" />}
                        </span>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground cursor-pointer hover:underline"
                          onClick={() => {
                            setEditingTargetId(item.id);
                            setEditingTargetValue('');
                          }}
                        >
                          Definir meta
                        </span>
                      )}
                      
                      {hasDiscount && (
                        <span className="text-xs text-success font-medium flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Abaixo!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheckPrice(item)}
                      disabled={checkingPriceId === item.id}
                      className="h-8 px-2 text-xs"
                    >
                      {checkingPriceId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Verificar'
                      )}
                    </Button>
                    
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm w-full max-w-md mx-4 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Adicionar à Wishlist</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ex: Notebook Gamer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Preço Atual (R$)</label>
                <Input
                  type="number"
                  value={newItem.price}
                  onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="5999"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Loja</label>
                <Input
                  value={newItem.store}
                  onChange={e => setNewItem({ ...newItem, store: e.target.value })}
                  placeholder="Amazon"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">URL (opcional)</label>
                <Input
                  value={newItem.url}
                  onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleAdd}
                className="w-full"
                disabled={!newItem.name || !newItem.price || addToWishlist.isPending}
              >
                {addToWishlist.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" /> Adicionar</>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
