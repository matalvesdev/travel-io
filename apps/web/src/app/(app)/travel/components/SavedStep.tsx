'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, PiggyBank, CreditCard, TrendingDown, Target, Sparkles, Plane, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { tripsApi } from '@/lib/api';
import { useTrip } from '../contexts/TripContext';
import { Progress } from '../components/Progress';
import { ToastDisplay } from '../components/ToastDisplay';

export function SavedStep() {
  const { savedTrips, setSavedTrips, totalMiles, setStep, setSelectedFlight, setSelectedHotel, showToast } = useTrip();
  const lastTrip = savedTrips[savedTrips.length - 1];
  const monthlyBudget = lastTrip ? Math.ceil(lastTrip.totalCost / 6) : 0;
  const dailyBudget = lastTrip ? Math.ceil(lastTrip.totalCost / 30) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <ToastDisplay />
      <Progress current={5} steps={['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo']} />
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3"><Check className="h-8 w-8 text-white" /></div>
        <h2 className="text-2xl font-bold">Viagem Salva!</h2>
        <p className="text-muted-foreground">{lastTrip?.destination} • {lastTrip?.startDate} a {lastTrip?.endDate}</p>
      </div>
      <div className="phantom-card p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-bold">Plano Financeiro com IA</h3></div>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="p-4 rounded-xl bg-background/50 text-center"><p className="text-xs text-muted-foreground mb-1">Total da Viagem</p><p className="text-2xl font-bold text-primary">{formatCurrency(lastTrip?.totalCost || 0)}</p></div>
          <div className="p-4 rounded-xl bg-background/50 text-center"><p className="text-xs text-muted-foreground mb-1">Economize 6 meses</p><p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyBudget)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p></div>
          <div className="p-4 rounded-xl bg-background/50 text-center"><p className="text-xs text-muted-foreground mb-1">Economize 30 dias</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(dailyBudget)}<span className="text-xs font-normal text-muted-foreground">/dia</span></p></div>
        </div>
        <div className="space-y-3">
          {[{ icon: PiggyBank, title: 'Economize com milhas', desc: `Use ${totalMiles.toLocaleString()} pontos para economizar até ${formatCurrency(totalMiles * 0.025)}`, color: 'text-blue-500' },
            { icon: CreditCard, title: 'PIX com desconto', desc: 'Pague via PIX e ganhe 5% de desconto na reserva', color: 'text-green-500' },
            { icon: TrendingDown, title: 'Compre com antecedência', desc: '60+ dias antes = até 30% de economia em voos e hotéis', color: 'text-purple-500' },
            { icon: Target, title: 'Defina uma meta', desc: `Meta mensal: ${formatCurrency(monthlyBudget)} durante 6 meses`, color: 'text-amber-500' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/30">
              <tip.icon className={`h-5 w-5 ${tip.color} mt-0.5`} />
              <div><p className="text-sm font-semibold">{tip.title}</p><p className="text-xs text-muted-foreground">{tip.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="phantom-card p-6">
        <h3 className="font-bold mb-4">Minhas Viagens</h3>
        <div className="space-y-3">
          {savedTrips.slice().reverse().map(trip => (
            <div key={trip.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Plane className="h-5 w-5 text-primary" /></div>
              <div className="flex-1"><p className="font-semibold text-sm">{trip.origin} → {trip.destination}</p><p className="text-xs text-muted-foreground">{trip.startDate} a {trip.endDate} • {trip.nights} noites</p></div>
              <div className="text-right"><p className="font-bold">{formatCurrency(trip.totalCost)}</p><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">{trip.status}</span></div>
              <button onClick={async () => { try { await tripsApi.deleteTrip(trip.id); const u = savedTrips.filter(t => t.id !== trip.id); setSavedTrips(u); showToast('Viagem removida'); } catch { showToast('Erro ao remover', 'error'); } }} className="p-1 hover:bg-muted rounded-lg"><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          ))}
          {savedTrips.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma viagem salva ainda</p>}
        </div>
      </div>
      <Button variant="outline" className="w-full py-5 rounded-xl" onClick={() => { setStep('plan'); setSelectedFlight(null); setSelectedHotel(null); }}><Search className="mr-2 h-4 w-4" /> Planejar Nova Viagem</Button>
    </motion.div>
  );
}
