'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Hotel, Calendar, MapPin, Star, Trash2, Check, X, ChevronRight, Sparkles, Wallet, TrendingUp, Target, CreditCard, ArrowRight, Plus, Search, Map, Loader2, Eye, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/analytics/metric-card';
import { useTrips, useUpdateTrip, useDeleteTrip } from '@/hooks/api/use-travel';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Trip } from '@/types/shared';

const STATUS_CONFIG = {
  planned: { label: 'Planejada', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Target },
  ongoing: { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Plane },
  completed: { label: 'Concluída', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: Check },
};

const STATUS_MAP = STATUS_CONFIG as Record<string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]>;

export default function TripsPage() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
  const [viewTrip, setViewTrip] = React.useState<Trip | null>(null);

  const { data, isLoading } = useTrips(filter === 'all' ? undefined : filter);
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();

  const trips = data?.trips || [];
  const totalSpent = trips.filter(t => t.status === 'completed').reduce((a, t) => a + (t.totalCost || 0), 0);
  const totalPlanned = trips.filter(t => t.status === 'planned').reduce((a, t) => a + t.totalCost, 0);
  const upcomingTrip = trips
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const handleChangeStatus = (id: string, newStatus: string) => {
    updateTripMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status alterado para "${STATUS_MAP[newStatus]?.label || newStatus}"`);
          if (viewTrip?.id === id) setViewTrip({ ...viewTrip!, status: newStatus });
        },
        onError: () => toast.error('Erro ao alterar status'),
      }
    );
  };

  const handleDeleteTrip = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta viagem?')) return;
    deleteTripMutation.mutate(id, {
      onSuccess: () => {
        if (viewTrip?.id === id) setViewTrip(null);
        toast.success('Viagem removida');
      },
      onError: () => toast.error('Erro ao remover'),
    });
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff > 0 ? `${diff} dias` : diff === 0 ? 'Hoje' : `${Math.abs(diff)} dias atrás`;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Viagens</h1>
          <p className="text-muted-foreground">{trips.length} viagem{trips.length !== 1 ? 'ens' : ''} registrada{trips.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => router.push('/travel')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"><Plus className="mr-2 h-4 w-4" /> Nova Viagem</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Planejadas"
          value={String(trips.filter(t => t.status === 'planned').length)}
          icon={Target}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Em Andamento"
          value={String(trips.filter(t => t.status === 'ongoing').length)}
          icon={Plane}
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Concluídas"
          value={String(trips.filter(t => t.status === 'completed').length)}
          icon={Check}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Total Investido"
          value={formatCurrency(totalSpent + totalPlanned)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
      </div>

      {/* Upcoming trip highlight */}
      {upcomingTrip && (
        <div className="phantom-card p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center"><Plane className="h-5 w-5 text-white" /></div>
            <div className="flex-1">
              <p className="text-xs text-blue-600 font-medium">Próxima Viagem</p>
              <p className="font-bold">{upcomingTrip.name || upcomingTrip.destination}</p>
              <p className="text-xs text-muted-foreground">{upcomingTrip.startDate} a {upcomingTrip.endDate} • {daysUntil(upcomingTrip.startDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(upcomingTrip.totalCost)}</p>
              <Button size="sm" variant="outline" className="mt-1" onClick={() => setViewTrip(upcomingTrip)}>Ver Detalhes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'planned', 'ongoing', 'completed'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}>
            {s === 'all' ? `Todas (${trips.length})` : `${STATUS_MAP[s]?.label || s} (${trips.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Trip cards */}
      {trips.length === 0 ? (
        <div className="phantom-card p-16 text-center">
          <Map className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground mb-2">Nenhuma viagem encontrada</p>
          <p className="text-sm text-muted-foreground mb-4">{filter === 'all' ? 'Comece planejando sua primeira viagem!' : `Nenhuma viagem com status "${STATUS_MAP[filter]?.label || filter}"`}</p>
          <Button onClick={() => router.push('/travel')}><Search className="mr-2 h-4 w-4" /> Planejar Viagem</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.slice().reverse().map((trip, i) => {
            const statusCfg = STATUS_MAP[trip.status] || STATUS_MAP.planned;
            const StatusIcon = statusCfg.icon;
            return (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="phantom-card overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => setViewTrip(trip)}>
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                      <StatusIcon className="h-3 w-3" />{statusCfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{daysUntil(trip.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="font-bold">{trip.name || trip.destination}</p>
                      <p className="text-xs text-muted-foreground">{trip.startDate} a {trip.endDate}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(trip.totalCost)}</span>
                  </div>
                </div>
                <div className="px-4 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); setViewTrip(trip); }}><Eye className="h-3 w-3 mr-1" /> Ver</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Trip Detail Panel */}
      <AnimatePresence>
        {viewTrip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={() => setViewTrip(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
              className="relative w-full max-w-lg bg-card border-l shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Detalhes da Viagem</h3>
                <button onClick={() => setViewTrip(null)} className="p-2 hover:bg-muted rounded-xl"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {(['planned', 'ongoing', 'completed'] as const).map(s => {
                    const cfg = STATUS_MAP[s];
                    if (!cfg) return null;
                    return (
                      <button key={s} onClick={() => handleChangeStatus(viewTrip.id, s)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${viewTrip.status === s ? cfg.color + ' ring-2 ring-primary/20' : 'border-border bg-background hover:bg-muted/50'}`}>
                        <cfg.icon className="h-3 w-3" />{cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Route */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-70 mb-1">Rota</p>
                  <div className="flex items-center justify-between">
                    <div><p className="text-2xl font-bold">{viewTrip.name || viewTrip.destination}</p><p className="text-sm opacity-70">{viewTrip.destination}</p></div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 opacity-70" /><span className="text-sm">{viewTrip.startDate} a {viewTrip.endDate}</span></div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="phantom-card p-4">
                  <div className="flex items-center gap-2 mb-3"><Wallet className="h-4 w-4 text-green-500" /><h4 className="font-semibold text-sm">Resumo Financeiro</h4></div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Custo total estimado</span><span className="text-sm font-bold text-primary">{formatCurrency(viewTrip.totalCost)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Economia mensal (6 meses)</span><span className="text-sm font-medium">{formatCurrency(Math.ceil(viewTrip.totalCost / 6))}/mês</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Economia diária (30 dias)</span><span className="text-sm font-medium">{formatCurrency(Math.ceil(viewTrip.totalCost / 30))}/dia</span></div>
                  </div>
                </div>

                {/* AI Tips */}
                <div className="phantom-card p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><h4 className="font-semibold text-sm">Dicas da IA</h4></div>
                  <div className="space-y-2">
                    {[
                      viewTrip.status === 'planned' && { icon: Target, text: `Faltam ${daysUntil(viewTrip.startDate)}. Economize ${formatCurrency(Math.ceil(viewTrip.totalCost / Math.max(1, Math.ceil((new Date(viewTrip.startDate).getTime() - Date.now()) / 86400000))))} por dia.` },
                      { icon: CreditCard, text: 'Use cartão com cashback para pagar a viagem e ganhe pontos de volta.' },
                    ].filter(Boolean).map((tip, i) => tip && (
                      <div key={i} className="flex items-start gap-2 text-xs"><tip.icon className="h-3.5 w-3.5 text-primary mt-0.5" /><span className="text-muted-foreground">{tip.text}</span></div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => { navigator.clipboard.writeText(`Viagem: ${viewTrip.name || viewTrip.destination}\n${viewTrip.startDate} a ${viewTrip.endDate}\nTotal: ${formatCurrency(viewTrip.totalCost)}`); toast.success('Copiado!'); }}>
                    <Bookmark className="mr-2 h-4 w-4" /> Compartilhar
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTrip(viewTrip.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remover Viagem
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
