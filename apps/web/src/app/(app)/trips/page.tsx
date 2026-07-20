'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Hotel, Calendar, MapPin, Clock, Star, Trash2, Check, X, ChevronRight, ExternalLink, Sparkles, Wallet, TrendingUp, Target, PiggyBank, CreditCard, ArrowRight, Plus, Search, Filter, Map, Coffee, Navigation, Bookmark, Eye, Edit3, CircleDot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { tripsApi } from '@/lib/api';

interface SavedTrip { id: string; origin: string; destination: string; startDate: string; endDate: string; flight: { airline: string; price: number; duration: string; stops: string; origin: string; destination: string; deepLink?: string } | null; hotel: { name: string; price: number; rating: number; address: string } | null; totalCost: number; nights: number; savedAt: string; status: 'planejada' | 'em andamento' | 'concluída'; notes?: string; spent?: number; }

const STATUS_CONFIG = {
  planejada: { label: 'Planejada', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Target },
  'em andamento': { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Plane },
  concluída: { label: 'Concluída', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: Check },
};

export default function TripsPage() {
  const [trips, setTrips] = React.useState<SavedTrip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'planejada' | 'em andamento' | 'concluída'>('all');
  const [viewTrip, setViewTrip] = React.useState<SavedTrip | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (m: string, t: 'success' | 'error' = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  const fetchTrips = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await tripsApi.getTrips();
      if (res.success) {
        setTrips((res.data?.trips || []).map((t: any) => ({
          id: t.id, origin: t.origin || 'N/A', destination: t.destination, startDate: t.start_date, endDate: t.end_date,
          flight: null, hotel: null, totalCost: t.budget || 0, nights: 0, savedAt: t.created_at || t.start_date,
          status: t.status === 'planned' ? 'planejada' : t.status === 'ongoing' ? 'em andamento' : t.status === 'completed' ? 'concluída' : 'planejada',
          notes: t.notes, spent: t.spent,
        })));
      }
    } catch {}
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const filteredTrips = filter === 'all' ? trips : trips.filter(t => t.status === filter);
  const totalSpent = trips.filter(t => t.status === 'concluída').reduce((a, t) => a + (t.spent || t.totalCost), 0);
  const totalPlanned = trips.filter(t => t.status === 'planejada').reduce((a, t) => a + t.totalCost, 0);
  const upcomingTrip = trips.filter(t => t.status !== 'concluída').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const handleChangeStatus = (id: string, newStatus: 'planejada' | 'em andamento' | 'concluída') => {
    const updated = trips.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTrips(updated);
    showToast(`Status alterado para "${STATUS_CONFIG[newStatus].label}"`);
    if (viewTrip?.id === id) setViewTrip({ ...viewTrip, status: newStatus });
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await tripsApi.deleteTrip(id);
      setTrips(trips.filter(t => t.id !== id));
      if (viewTrip?.id === id) setViewTrip(null);
      showToast('Viagem removida');
    } catch { showToast('Erro ao remover', 'error'); }
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff > 0 ? `${diff} dias` : diff === 0 ? 'Hoje' : `${Math.abs(diff)} dias atrás`;
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'}`}>
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Viagens</h1>
          <p className="text-muted-foreground">{trips.length} viagem{trips.length !== 1 ? 'ens' : ''} registrada{trips.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => window.location.href = '/travel'} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"><Plus className="mr-2 h-4 w-4" /> Nova Viagem</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Target className="h-5 w-5 text-blue-500" /></div>
            <div><p className="text-xs text-muted-foreground">Planejadas</p><p className="text-xl font-bold">{trips.filter(t => t.status === 'planejada').length}</p></div>
          </div>
        </div>
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Plane className="h-5 w-5 text-amber-500" /></div>
            <div><p className="text-xs text-muted-foreground">Em Andamento</p><p className="text-xl font-bold">{trips.filter(t => t.status === 'em andamento').length}</p></div>
          </div>
        </div>
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Check className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-xs text-muted-foreground">Concluídas</p><p className="text-xl font-bold">{trips.filter(t => t.status === 'concluída').length}</p></div>
          </div>
        </div>
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-purple-500" /></div>
            <div><p className="text-xs text-muted-foreground">Total Investido</p><p className="text-xl font-bold">{formatCurrency(totalSpent + totalPlanned)}</p></div>
          </div>
        </div>
      </div>

      {/* Upcoming trip highlight */}
      {upcomingTrip && (
        <div className="phantom-card p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center"><Plane className="h-5 w-5 text-white" /></div>
            <div className="flex-1">
              <p className="text-xs text-blue-600 font-medium">Próxima Viagem</p>
              <p className="font-bold">{upcomingTrip.origin} → {upcomingTrip.destination}</p>
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
        {(['all', 'planejada', 'em andamento', 'concluída'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}>
            {s === 'all' ? `Todas (${trips.length})` : `${STATUS_CONFIG[s].label} (${trips.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Trip cards */}
      {filteredTrips.length === 0 ? (
        <div className="phantom-card p-16 text-center">
          <Map className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground mb-2">Nenhuma viagem encontrada</p>
          <p className="text-sm text-muted-foreground mb-4">{filter === 'all' ? 'Comece planejando sua primeira viagem!' : `Nenhuma viagem com status "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label}"`}</p>
          <Button onClick={() => window.location.href = '/travel'}><Search className="mr-2 h-4 w-4" /> Planejar Viagem</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTrips.slice().reverse().map((trip, i) => {
            const StatusIcon = STATUS_CONFIG[trip.status].icon;
            return (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="phantom-card overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => setViewTrip(trip)}>
                {/* Header bar */}
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[trip.status].color}`}>
                      <StatusIcon className="h-3 w-3" />{STATUS_CONFIG[trip.status].label}
                    </span>
                    <span className="text-xs text-muted-foreground">{daysUntil(trip.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="font-bold">{trip.origin} → {trip.destination}</p>
                      <p className="text-xs text-muted-foreground">{trip.startDate} a {trip.endDate} • {trip.nights} noite{trip.nights > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div className="px-4 pb-4 space-y-2">
                  {trip.flight && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Plane className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs flex-1">{trip.flight.airline} • {trip.flight.duration}</span>
                      <span className="text-xs font-bold">{formatCurrency(trip.flight.price)}</span>
                    </div>
                  )}
                  {trip.hotel && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Hotel className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs flex-1 truncate">{trip.hotel.name}</span>
                      <span className="text-xs font-bold">{formatCurrency(trip.hotel.price * trip.nights)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(trip.totalCost)}</span>
                  </div>
                </div>
                {/* Hover actions */}
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
                  {(['planejada', 'em andamento', 'concluída'] as const).map(s => {
                    const cfg = STATUS_CONFIG[s];
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
                    <div><p className="text-2xl font-bold">{viewTrip.origin}</p><p className="text-sm opacity-70">Origem</p></div>
                    <ArrowRight className="h-6 w-6 opacity-50" />
                    <div className="text-right"><p className="text-2xl font-bold">{viewTrip.destination}</p><p className="text-sm opacity-70">Destino</p></div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 opacity-70" /><span className="text-sm">{viewTrip.startDate} a {viewTrip.endDate}</span></div>
                    <span className="text-sm opacity-70">{viewTrip.nights} noite{viewTrip.nights > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Flight */}
                {viewTrip.flight && (
                  <div className="phantom-card p-4">
                    <div className="flex items-center gap-2 mb-3"><Plane className="h-4 w-4 text-blue-500" /><h4 className="font-semibold text-sm">Voo</h4></div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Companhia</span><span className="text-sm font-medium">{viewTrip.flight.airline}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Rota</span><span className="text-sm font-medium">{viewTrip.flight.origin} → {viewTrip.flight.destination}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Duração</span><span className="text-sm font-medium">{viewTrip.flight.duration}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Escalas</span><span className="text-sm font-medium">{viewTrip.flight.stops}</span></div>
                      <div className="flex justify-between border-t pt-2"><span className="text-sm font-semibold">Preço</span><span className="text-sm font-bold">{formatCurrency(viewTrip.flight.price)}</span></div>
                    </div>
                    {viewTrip.flight.deepLink && <Button size="sm" className="w-full mt-3" onClick={() => window.open(viewTrip.flight!.deepLink, '_blank')}><ExternalLink className="h-3 w-3 mr-1" /> Reservar Agora</Button>}
                  </div>
                )}

                {/* Hotel */}
                {viewTrip.hotel && (
                  <div className="phantom-card p-4">
                    <div className="flex items-center gap-2 mb-3"><Hotel className="h-4 w-4 text-amber-500" /><h4 className="font-semibold text-sm">Hotel</h4></div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Nome</span><span className="text-sm font-medium">{viewTrip.hotel.name}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Localização</span><span className="text-sm font-medium">{viewTrip.hotel.address}</span></div>
                      {viewTrip.hotel.rating > 0 && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Avaliação</span><span className="text-sm font-medium flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{viewTrip.hotel.rating.toFixed(1)}</span></div>}
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Por noite</span><span className="text-sm font-medium">{formatCurrency(viewTrip.hotel.price)}</span></div>
                      <div className="flex justify-between border-t pt-2"><span className="text-sm font-semibold">Total ({viewTrip.nights} noites)</span><span className="text-sm font-bold">{formatCurrency(viewTrip.hotel.price * viewTrip.nights)}</span></div>
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="phantom-card p-4">
                  <div className="flex items-center gap-2 mb-3"><Wallet className="h-4 w-4 text-green-500" /><h4 className="font-semibold text-sm">Resumo Financeiro</h4></div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Custo total estimado</span><span className="text-sm font-bold text-primary">{formatCurrency(viewTrip.totalCost)}</span></div>
                    {viewTrip.status === 'concluída' && viewTrip.spent && viewTrip.spent !== viewTrip.totalCost && (
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Valor gasto real</span><span className={`text-sm font-bold ${viewTrip.spent < viewTrip.totalCost ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(viewTrip.spent)} {viewTrip.spent < viewTrip.totalCost ? `(economizou ${formatCurrency(viewTrip.totalCost - viewTrip.spent)})` : `(gastou mais ${formatCurrency(viewTrip.spent - viewTrip.totalCost)})`}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Economia mensal (6 meses)</span><span className="text-sm font-medium">{formatCurrency(Math.ceil(viewTrip.totalCost / 6))}/mês</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Economia diária (30 dias)</span><span className="text-sm font-medium">{formatCurrency(Math.ceil(viewTrip.totalCost / 30))}/dia</span></div>
                  </div>
                </div>

                {/* AI Tips */}
                <div className="phantom-card p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><h4 className="font-semibold text-sm">Dicas da IA</h4></div>
                  <div className="space-y-2">
                    {[
                      viewTrip.status === 'planejada' && { icon: Target, text: `Faltam ${daysUntil(viewTrip.startDate)}. Economize ${formatCurrency(Math.ceil(viewTrip.totalCost / Math.max(1, Math.ceil((new Date(viewTrip.startDate).getTime() - Date.now()) / 86400000))))} por dia.` },
                      { icon: CreditCard, text: 'Use cartão com cashback para pagar a viagem e ganhe pontos de volta.' },
                      viewTrip.nights >= 5 && { icon: TrendingUp, text: `Com ${viewTrip.nights} noites, negocie desconto no hotel por estadia longa.` },
                    ].filter(Boolean).map((tip, i) => tip && (
                      <div key={i} className="flex items-start gap-2 text-xs"><tip.icon className="h-3.5 w-3.5 text-primary mt-0.5" /><span className="text-muted-foreground">{tip.text}</span></div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => { navigator.clipboard.writeText(`Viagem: ${viewTrip.origin} → ${viewTrip.destination}\n${viewTrip.startDate} a ${viewTrip.endDate}\nTotal: ${formatCurrency(viewTrip.totalCost)}`); showToast('Copiado!'); }}>
                    <Bookmark className="mr-2 h-4 w-4" /> Compartilhar
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl text-destructive hover:bg-destructive/10" onClick={() => { handleDeleteTrip(viewTrip.id); }}>
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
