'use client';

import * as React from 'react';
import { Bell, Loader2, Trash2, ExternalLink, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useMonitors, useAddMonitor, useRemoveMonitor } from '@/hooks/api/use-shopping';

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export function MonitorsPanel() {
  const { data: monitorsData, isLoading } = useMonitors();
  const addMonitor = useAddMonitor();
  const removeMonitor = useRemoveMonitor();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newMonitor, setNewMonitor] = React.useState({ name: '', url: '', targetPrice: '' });

  const monitors = React.useMemo(() => {
    if (!monitorsData) return [];
    return monitorsData.map((m: any) => ({
      id: m.id,
      product_name: m.product_name,
      url: m.url || '',
      target_price: m.target_price || 0,
      current_price: m.current_price || 0,
      is_active: m.is_active ?? true,
      created_at: m.created_at,
    }));
  }, [monitorsData]);

  const handleAdd = () => {
    if (!newMonitor.url || !newMonitor.name) return;
    addMonitor.mutate({
      product_name: newMonitor.name,
      url: newMonitor.url,
      target_price: parseFloat(newMonitor.targetPrice) || 0,
      current_price: 0,
      is_active: true,
    }, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewMonitor({ name: '', url: '', targetPrice: '' });
      },
    });
  };

  const handleRemove = (id: string) => {
    removeMonitor.mutate(id);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-violet-500" />
          <span className="text-sm text-muted-foreground">{monitors.length} monitor(es)</span>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
          <Plus className="mr-1 h-3 w-3" /> Adicionar
        </Button>
      </div>

      {monitors.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum monitor ativo. Adicione um produto para acompanhar seu preço.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monitors.map((m: any) => {
            const belowTarget = m.target_price > 0 && m.current_price > 0 && m.current_price <= m.target_price;
            return (
              <div key={m.id} className="rounded-xl border border-border/50 bg-card/80 p-4 hover:bg-muted/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{m.product_name}</p>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                        {extractDomain(m.url)} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Preço Atual</p>
                        <p className="font-semibold text-sm">{m.current_price > 0 ? formatCurrency(m.current_price) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Preço Meta</p>
                        <p className="text-sm text-muted-foreground">{m.target_price > 0 ? formatCurrency(m.target_price) : 'Não definido'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {belowTarget ? (
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">Abaixo da Meta!</span>
                    ) : m.current_price > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Aguardando</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-500">A Verificar</span>
                    )}
                    <button onClick={() => handleRemove(m.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      disabled={removeMonitor.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Monitorar Preço</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <p className="text-sm text-muted-foreground">Cole o link do produto. O sistema acompanhará o preço e alertará quando baixar.</p>
            <div>
              <label className="text-sm font-medium">Nome do Produto</label>
              <Input value={newMonitor.name} onChange={e => setNewMonitor({ ...newMonitor, name: e.target.value })} placeholder="Ex: iPhone 15 Pro" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">URL do Produto</label>
              <Input value={newMonitor.url} onChange={e => setNewMonitor({ ...newMonitor, url: e.target.value })} placeholder="https://www.amazon.com.br/dp/..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Preço Meta (R$) — opcional</label>
              <Input type="number" value={newMonitor.targetPrice} onChange={e => setNewMonitor({ ...newMonitor, targetPrice: e.target.value })} placeholder="Deixe vazio para sem meta" className="mt-1" />
            </div>
            <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              disabled={!newMonitor.url || !newMonitor.name || addMonitor.isPending}>
              {addMonitor.isPending ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Adicionando...</> : <><Bell className="mr-2 h-4 w-4" /> Iniciar Monitoramento</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
