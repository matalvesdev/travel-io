'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2, Trash2, ExternalLink, Plus, X, Check, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useMonitors, useAddMonitor, useRemoveMonitor, useUpdateMonitor } from '@/hooks/api/use-shopping';
import { toast } from 'sonner';
import type { PriceMonitor } from '@/types/shopping';

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export function MonitorsPanel() {
  const { data: monitorsData, isLoading } = useMonitors();
  const addMonitor = useAddMonitor();
  const removeMonitor = useRemoveMonitor();
  const updateMonitor = useUpdateMonitor();
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newMonitor, setNewMonitor] = React.useState({ name: '', url: '', targetPrice: '' });
  const [checkingId, setCheckingId] = React.useState<string | null>(null);

  const monitors: PriceMonitor[] = React.useMemo(() => {
    if (!monitorsData) return [];
    return monitorsData.monitors || [];
  }, [monitorsData]);

  const handleAdd = () => {
    if (!newMonitor.url || !newMonitor.name) return;
    addMonitor.mutate(
      {
        product_name: newMonitor.name,
        url: newMonitor.url,
        target_price: parseFloat(newMonitor.targetPrice) || 0,
        current_price: 0,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setNewMonitor({ name: '', url: '', targetPrice: '' });
          toast.success('Monitor adicionado!');
        },
        onError: () => {
          toast.error('Erro ao adicionar monitor');
        },
      }
    );
  };

  const handleRemove = (id: string) => {
    removeMonitor.mutate(id, {
      onSuccess: () => toast.success('Monitor removido'),
      onError: () => toast.error('Erro ao remover monitor'),
    });
  };

  const handleCheckPrice = async (monitor: PriceMonitor) => {
    setCheckingId(monitor.id);
    toast.info('Verificando preço...');
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(monitor.productName)}&store=all`);
      const data = await res.json();
      const products = data.products || [];
      const count = products.length;
      
      if (count > 0) {
        const cheapest = products[0];
        const newPrice = cheapest.price;
        const oldPrice = Number(monitor.currentPrice) || 0;
        
        // Update monitor with new price and history
        updateMonitor.mutate({
          id: monitor.id,
          current_price: newPrice,
          lowest_price: Math.min(Number(monitor.lowestPrice) || newPrice, newPrice),
          last_checked: new Date().toISOString(),
          price_history: [{ price: newPrice, timestamp: new Date().toISOString(), source: cheapest.store }],
        });
        
        // Show result
        if (oldPrice > 0) {
          const change = ((newPrice - oldPrice) / oldPrice) * 100;
          if (change < 0) {
            toast.success(`Preço caiu ${Math.abs(change).toFixed(1)}%! Melhor preço: ${formatCurrency(newPrice)}`);
          } else if (change > 0) {
            toast.warning(`Preço subiu ${change.toFixed(1)}%. Melhor preço: ${formatCurrency(newPrice)}`);
          } else {
            toast.info(`Preço mantido: ${formatCurrency(newPrice)}`);
          }
        } else {
          toast.success(`${count} produto(s) encontrado(s). Melhor preço: ${formatCurrency(newPrice)}`);
        }
        
        // Check if below target
        const target = Number(monitor.targetPrice) || 0;
        if (target > 0 && newPrice <= target) {
          toast.success('Abaixo da meta!');
        }
      } else {
        toast.error('Nenhum produto encontrado');
      }
    } catch (error) {
      toast.error('Erro ao verificar preço');
    } finally {
      setCheckingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-1/4 rounded bg-muted" />
              </div>
              <div className="h-8 w-8 rounded bg-muted" />
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
          <Bell className="h-5 w-5 text-violet-500" />
          <span className="text-sm text-muted-foreground">{monitors.length} monitor(es)</span>
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
      {monitors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border/50 bg-card/80 p-8 text-center"
        >
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground">Nenhum monitor ativo. Adicione um produto para acompanhar seu preço.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {monitors.map((monitor, index) => {
              const current = Number(monitor.currentPrice) || 0;
              const target = Number(monitor.targetPrice) || 0;
              const lowest = Number(monitor.lowestPrice) || 0;
              const isBelowTarget = target > 0 && current > 0 && current <= target;
              const isChecking = checkingId === monitor.id;
              
              return (
                <motion.div
                  key={monitor.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border/50 bg-card/80 p-4 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{monitor.productName}</p>
                      {monitor.url && (
                        <a
                          href={monitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {extractDomain(monitor.url)} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Preço Atual</p>
                          <p className="font-semibold text-sm">
                            {current > 0 ? formatCurrency(current) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Preço Meta</p>
                          <p className="text-sm text-muted-foreground">
                            {target > 0 ? formatCurrency(target) : 'Não definido'}
                          </p>
                        </div>
                        {lowest > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Menor Preço</p>
                            <p className="text-sm text-success font-medium">{formatCurrency(lowest)}</p>
                          </div>
                        )}
                      </div>
                      
                      {monitor.lastChecked && (
                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última verificação: {new Date(monitor.lastChecked).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      {isBelowTarget ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                          <TrendingDown className="h-3 w-3" />
                          Abaixo da Meta!
                        </span>
                      ) : current > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Aguardando
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-500">
                          A Verificar
                        </span>
                      )}
                      
                      {/* Check Price Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckPrice(monitor)}
                        disabled={isChecking}
                        className="h-8 px-2 text-xs"
                      >
                        {isChecking ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Verificar Agora'
                        )}
                      </Button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemove(monitor.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={removeMonitor.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold">Monitorar Preço</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Cole o link do produto. O sistema acompanhará o preço e alertará quando baixar.
              </p>
              
              <div>
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input
                  value={newMonitor.name}
                  onChange={e => setNewMonitor({ ...newMonitor, name: e.target.value })}
                  placeholder="Ex: iPhone 15 Pro"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">URL do Produto</label>
                <Input
                  value={newMonitor.url}
                  onChange={e => setNewMonitor({ ...newMonitor, url: e.target.value })}
                  placeholder="https://www.amazon.com.br/dp/..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Preço Meta (R$) — opcional</label>
                <Input
                  type="number"
                  value={newMonitor.targetPrice}
                  onChange={e => setNewMonitor({ ...newMonitor, targetPrice: e.target.value })}
                  placeholder="Deixe vazio para sem meta"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleAdd}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                disabled={!newMonitor.url || !newMonitor.name || addMonitor.isPending}
              >
                {addMonitor.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</>
                ) : (
                  <><Bell className="mr-2 h-4 w-4" /> Iniciar Monitoramento</>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
