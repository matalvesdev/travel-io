'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Plane, Hotel, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useTrip } from '../contexts/TripContext';
import { Progress } from '../components/Progress';
import { ToastDisplay } from '../components/ToastDisplay';

export function ConfirmStep() {
  const { setStep, origin, destination, startDate, endDate, nights, travelers, selectedFlight, selectedHotel, totalCost, generateItinerary, setItineraryDay } = useTrip();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
      <ToastDisplay />
      <Progress current={3} steps={['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo']} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep('hotels')}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-xl font-bold">Confirme sua viagem</h2>
      </div>
      <div className="phantom-card p-6">
        <div className="flex items-center gap-3 mb-4"><MapPin className="h-5 w-5 text-primary" /><h3 className="font-bold">{origin} → {destination}</h3></div>
        <div className="grid gap-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-medium">{startDate}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span className="font-medium">{endDate}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Noites</span><span className="font-medium">{nights}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Viajantes</span><span className="font-medium">{travelers}</span></div></div>
      </div>
      {selectedFlight && (
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3 mb-3"><Plane className="h-5 w-5 text-blue-500" /><h3 className="font-bold">Voo Selecionado</h3></div>
          <div className="flex items-center justify-between">
            <div><p className="font-semibold">{selectedFlight.airline}</p><p className="text-sm text-muted-foreground">{selectedFlight.origin} → {selectedFlight.destination} • {selectedFlight.duration} • {selectedFlight.stops}</p></div>
            <p className="text-xl font-bold">{formatCurrency(selectedFlight.price)}</p>
          </div>
          {selectedFlight.deepLink && <Button size="sm" variant="outline" className="mt-3" onClick={() => window.open(selectedFlight.deepLink, '_blank')}><ExternalLink className="h-3 w-3 mr-1" /> Reservar agora</Button>}
        </div>
      )}
      {selectedHotel && (
        <div className="phantom-card p-5">
          <div className="flex items-center gap-3 mb-3"><Hotel className="h-5 w-5 text-amber-500" /><h3 className="font-bold">Hotel Selecionado</h3></div>
          <div className="flex items-center justify-between">
            <div><p className="font-semibold">{selectedHotel.name}</p><p className="text-sm text-muted-foreground">{selectedHotel.address} • {selectedHotel.rating > 0 ? `★ ${selectedHotel.rating.toFixed(1)}` : ''} • {nights} noite{nights > 1 ? 's' : ''}</p></div>
            <div className="text-right"><p className="text-xl font-bold">{formatCurrency(selectedHotel.price * nights)}</p><p className="text-xs text-muted-foreground">{formatCurrency(selectedHotel.price)}/noite</p></div>
          </div>
        </div>
      )}
      <div className="phantom-card p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Custo Total</p><p className="text-3xl font-bold text-green-700">{formatCurrency(totalCost)}</p></div><p className="text-sm text-green-600">{nights} noites em {destination}</p></div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 py-5 rounded-xl" onClick={() => setStep('hotels')}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        <Button className="flex-1 py-5 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl" onClick={() => { generateItinerary(); setStep('itinerary'); setItineraryDay(1); }}><Sparkles className="mr-2 h-5 w-5" /> Gerar Roteiro IA</Button>
      </div>
    </motion.div>
  );
}
