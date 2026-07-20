'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronDown, Loader2, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '../contexts/TripContext';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { ToastDisplay } from '../components/ToastDisplay';

export function PlanStep() {
  const { origin, setOrigin, destination, setDestination, startDate, setStartDate, endDate, setEndDate, travelers, setTravelers, searching, showToast, setStep, searchFlights } = useTrip();
  const CACHE_KEY = 'travelio_travel_data';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ToastDisplay />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo'].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="flex-1 h-px bg-border" />}
            <span className={`flex items-center gap-1 ${i === 0 ? 'text-primary font-semibold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i === 0 ? 'bg-primary text-white' : 'bg-muted'}`}>{i + 1}</span>{s}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white">
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-2">✈️ Travel.IO</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Planeje sua próxima viagem</h1>
          <p className="text-blue-100/80 text-base max-w-xl">Defina o destino e datas. A IA cuida do resto.</p>
        </div>
      </div>
      <div className="phantom-card p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <CityAutocomplete value={origin} onChange={setOrigin} placeholder="São Paulo" icon={MapPin} label="Origem" />
          <CityAutocomplete value={destination} onChange={setDestination} placeholder="Para onde?" icon={MapPin} label="Destino" />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl border bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl border bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Viajantes</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select value={travelers} onChange={e => setTravelers(e.target.value)} className="w-full rounded-xl border bg-background/50 pl-10 pr-4 py-3 text-sm appearance-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} viajante{n > 1 ? 's' : ''}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <Button onClick={() => { if (!destination || !startDate || !endDate) { showToast('Preencha destino e datas', 'error'); return; } localStorage.setItem(CACHE_KEY, JSON.stringify({ origin, destination })); setStep('flights'); searchFlights(); }}
          disabled={!destination || !startDate || !endDate || searching}
          className="w-full mt-6 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25">
          {searching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
          {searching ? 'Buscando...' : 'Buscar Voos'}
        </Button>
      </div>
    </motion.div>
  );
}
