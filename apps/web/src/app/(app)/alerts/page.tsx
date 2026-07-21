'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plane, Hotel, Trash2, Check, X, TrendingDown, TrendingUp,
  RefreshCw, Loader2, MapPin, Calendar, Sparkles, Target, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useAlerts, useCreateAlert, useDeleteAlert, useUpdateAlert } from '@/hooks/api/use-alerts';
import { MetricCard } from '@/components/analytics/metric-card';
import type { PriceAlert } from '@/lib/api/alerts';

function calcTrend(history: { price: number; date: string }[]) {
  if (history.length < 2) return { direction: 'stable' as const, change: 0, changePct: 0 };
  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  const change = last - prev;
  const changePct = prev > 0 ? (change / prev) * 100 : 0;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  return { direction, change, changePct };
}

export default function AlertsPage() {
  const { data, isLoading } = useAlerts();
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();
  const updateAlert = useUpdateAlert();

  const alerts: PriceAlert[] = data?.alerts ?? [];
  const [showForm, setShowForm] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (m: string, t: 'success' | 'error' = 'success') => {
    setToast({ message: m, type: t });
    setTimeout(() => setToast(null), 3000);
  };

  const belowTarget = alerts.filter(
    (a) => a.target_price > 0 && a.current_price > 0 && a.current_price <= a.target_price,
  );
  const activeAlerts = alerts.filter((a) => a.active);

  const handleCreate = async (data: Partial<PriceAlert>) => {
    try {
      await createAlert.mutateAsync(data);
      setShowForm(false);
      showToast('Alerta criado!');
    } catch {
      showToast('Erro ao criar alerta', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert.mutateAsync(id);
      showToast('Alerta removido');
    } catch {
      showToast('Erro ao remover alerta', 'error');
    }
  };

  const handleSetTarget = async (alertId: string, target: number) => {
    try {
      await updateAlert.mutateAsync({ id: alertId, target_price: target });
      showToast(`Meta definida: ${formatCurrency(target)}`);
    } catch {
      showToast('Erro ao definir meta', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${
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
          <h1 className="text-3xl font-bold">Alertas</h1>
          <p className="text-muted-foreground">
            {alerts.length} monitor(es) ativo{alerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" /> Novo Alerta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Ativos" value={String(activeAlerts.length)} icon={Bell} iconColor="text-primary" />
        <MetricCard title="Abaixo da Meta" value={String(belowTarget.length)} icon={TrendingDown} iconColor="text-green-500" />
        <MetricCard title="Com Meta" value={String(alerts.filter((a) => a.target_price > 0).length)} icon={Target} iconColor="text-blue-500" />
      </div>

      {/* Below target highlight */}
      {belowTarget.length > 0 && (
        <div className="phantom-card p-4 bg-green-500/5 border border-green-500/20">
          <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> Preços abaixo da meta!
          </p>
          {belowTarget.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 mb-1">
              <span className="text-xs font-bold text-green-600">{formatCurrency(a.current_price)}</span>
              <span className="text-xs text-muted-foreground">meta: {formatCurrency(a.target_price)}</span>
              <span className="text-xs text-green-600 font-semibold">
                -{Math.round(((a.target_price - a.current_price) / a.target_price) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Alerts list */}
      {isLoading ? (
        <div className="phantom-card p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="phantom-card p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Nenhum alerta configurado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Clique em &quot;Novo Alerta&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const trend = calcTrend(alert.history);
            const isBelow = alert.target_price > 0 && alert.current_price > 0 && alert.current_price <= alert.target_price;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`phantom-card p-4 ${isBelow ? 'ring-2 ring-green-500/30 bg-green-500/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.type === 'flight' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                    {alert.type === 'flight' ? <Plane className="h-5 w-5 text-blue-500" /> : <Hotel className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{alert.name}</p>
                      {isBelow && <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">META!</span>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{alert.destination} · <Calendar className="h-3 w-3" />{alert.checkin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(alert.current_price)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      {trend.direction === 'down' && (
                        <>
                          <TrendingDown className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">{trend.changePct.toFixed(1)}%</span>
                        </>
                      )}
                      {trend.direction === 'up' && (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">+{trend.changePct.toFixed(1)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-[10px] text-muted-foreground mb-1">Meta</p>
                    {alert.target_price > 0 ? (
                      <p className="text-sm font-semibold">{formatCurrency(alert.target_price)}</p>
                    ) : (
                      <button
                        onClick={() => handleSetTarget(alert.id, Math.round(alert.current_price * 0.85))}
                        className="text-xs text-primary hover:underline"
                      >
                        Definir meta
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create alert modal */}
      <AnimatePresence>
        {showForm && (
          <AlertForm onClose={() => setShowForm(false)} onSubmit={handleCreate} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AlertForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Partial<PriceAlert>) => Promise<void>;
}) {
  const [type, setType] = React.useState<'flight' | 'hotel'>('flight');
  const [name, setName] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [checkin, setCheckin] = React.useState('');
  const [checkout, setCheckout] = React.useState('');
  const [targetPrice, setTargetPrice] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      destination,
      checkin,
      checkout,
      target_price: targetPrice ? Number(targetPrice) : 0,
      current_price: 0,
      history: [],
      active: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="phantom-card p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Novo Alerta</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('flight')}
              className={`flex-1 p-2 rounded-lg text-sm font-medium border transition-colors ${
                type === 'flight' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
              }`}
            >
              <Plane className="h-4 w-4 mr-1 inline" /> Voo
            </button>
            <button
              type="button"
              onClick={() => setType('hotel')}
              className={`flex-1 p-2 rounded-lg text-sm font-medium border transition-colors ${
                type === 'hotel' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
              }`}
            >
              <Hotel className="h-4 w-4 mr-1 inline" /> Hotel
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do alerta"
            className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
            required
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destino"
            className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm"
            />
          </div>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Preço alvo (opcional)"
            className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Alerta
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
