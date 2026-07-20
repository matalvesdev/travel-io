'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, MapPin, Wallet, Loader2, Search, ExternalLink, Plus, Bell, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useTrip } from '../contexts/TripContext';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { MilesPromotions } from '../components/MilesPromotions';
import { ToastDisplay } from '../components/ToastDisplay';

export function MilesPanel() {
  const { setStep, totalMiles, milesSearchResults, milesSearching, milesOrigin, setMilesOrigin, milesDest, setMilesDest, milesDate, setMilesDate, milesAccounts, showToast, searchMilesFlights, ref } = useTrip();
  const MILES_RATES = ref?.milesRates || {};
  const CREDIT_CARDS_MILES = ref?.creditCardsMiles || [];
  const milesPrograms = ref?.milesPrograms || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <ToastDisplay />
      <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setStep('plan')}><ArrowLeft className="h-4 w-4" /></Button><div><h2 className="text-xl font-bold">Milhas & Pontos</h2><p className="text-sm text-muted-foreground">Monitore promoções, acumule e resgate com inteligência</p></div></div>
      <div className="phantom-card p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center justify-between mb-4"><div><p className="text-sm text-muted-foreground">Saldo Total</p><p className="text-3xl font-bold">{totalMiles.toLocaleString()} <span className="text-lg text-muted-foreground">pontos</span></p><p className="text-sm text-green-600 mt-1">Valor estimado: {formatCurrency(totalMiles * 0.025)}</p></div><div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Wallet className="h-7 w-7 text-primary" /></div></div>
      </div>
      <div className="phantom-card p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /> Buscar Voos com Milhas</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <CityAutocomplete value={milesOrigin} onChange={setMilesOrigin} placeholder="Origem" icon={MapPin} />
          <CityAutocomplete value={milesDest} onChange={setMilesDest} placeholder="Destino" icon={MapPin} />
          <input type="date" value={milesDate} onChange={e => setMilesDate(e.target.value)} className="rounded-xl border bg-background/50 px-4 py-3 text-sm" />
          <Button onClick={searchMilesFlights} disabled={milesSearching} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {milesSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}Buscar
          </Button>
        </div>
        {milesSearchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {milesSearchResults.slice(0, 5).map((f, i) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{f.airline.substring(0, 3).toUpperCase()}</span>
                  <div><p className="text-sm font-medium">{f.airline}</p><p className="text-xs text-muted-foreground">{f.duration} • {f.stops}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold">{f.price.toLocaleString()} milhas</p><p className="text-[10px] text-muted-foreground">{f.origin} → {f.destination}</p></div>
                {f.deepLink && <Button size="sm" variant="outline" className="ml-2" onClick={() => window.open(f.deepLink, '_blank')}><ExternalLink className="h-3 w-3" /></Button>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="phantom-card p-6">
          <h3 className="font-bold mb-3">Programas</h3>
          <div className="space-y-2">
            {milesPrograms.map((p: any) => { const acc = milesAccounts.find((a: any) => a.program === p.name); const rate = MILES_RATES[p.name as keyof typeof MILES_RATES]; return (
              <div key={p.name} className="p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: p.color }}>{p.icon}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{p.name}</p></div>
                  <p className="text-sm font-bold">{acc ? acc.balance.toLocaleString() : '0'} <span className="text-xs text-muted-foreground">pts</span></p>
                </div>
                {rate && <p className="text-[11px] text-muted-foreground ml-11">{(rate as any).promoTip}</p>}
              </div>);})}
          </div>
        </div>
        <div className="phantom-card p-6">
          <h3 className="font-bold mb-3">Cartões para Acumular Milhas</h3>
          <div className="space-y-2">
            {CREDIT_CARDS_MILES.map((c: any) => (
              <div key={c.name} className="p-3 rounded-xl border">
                <div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold">{c.name}</p><span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">{c.highlight}</span></div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground"><span>{c.earnRate}</span><span>{c.annualFee}</span><span>→ {c.transferTo}</span></div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 Dica da IA</p>
            <p className="text-xs text-amber-600">Use o cartão que transfere para o programa que você mais usa. Ex: se acumula Smiles, use C6 Black. Se Livelo, use Itaú Ultravioleta.</p>
          </div>
        </div>
      </div>
      <div className="phantom-card p-6">
        <h3 className="font-bold mb-3">Adicionar Milhas</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <select id="miles-program" className="rounded-xl border bg-background/50 px-4 py-3 text-sm">{milesPrograms.map((p: any) => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
          <input id="miles-balance" type="number" placeholder="Saldo" className="rounded-xl border bg-background/50 px-4 py-3 text-sm" />
        </div>
        <Button onClick={async () => { const prog = (document.getElementById('miles-program') as HTMLSelectElement)?.value || milesPrograms[0]?.name || ''; const bal = parseInt((document.getElementById('miles-balance') as HTMLInputElement)?.value || '0'); if (bal <= 0) { showToast('Saldo inválido', 'error'); return; } try { await apiClient.post('/api/miles', { program: prog, balance: bal }); showToast(`${bal.toLocaleString()} pontos adicionados!`); } catch { showToast('Erro ao adicionar milhas', 'error'); } }} className="mt-3"><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
      </div>
      <div className="phantom-card p-6">
        <h3 className="font-bold mb-3">Comparativo de Valor por Programa</h3>
        <div className="grid gap-3 md:grid-cols-5">
          {milesPrograms.map((p: any) => { const rate = MILES_RATES[p.name as keyof typeof MILES_RATES]; const acc = milesAccounts.find((a: any) => a.program === p.name); const val = (acc?.balance || 0) * ((rate as any)?.valuePerPoint || 0.025); return (
            <div key={p.name} className="text-center p-3 rounded-xl border">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm mx-auto mb-2" style={{ backgroundColor: p.color }}>{p.icon}</div>
              <p className="text-xs font-medium mb-1">{p.name.split(' ')[0]}</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(val)}</p>
              <p className="text-[10px] text-muted-foreground">R${((rate as any)?.valuePerPoint || 0.025).toFixed(3)}/pt</p>
            </div>);})}
        </div>
      </div>
      <MilesPromotions curatedPromos={ref?.curatedPromos || []} />
    </motion.div>
  );
}
