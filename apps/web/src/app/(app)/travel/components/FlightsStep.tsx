'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useTrip } from '../contexts/TripContext';
import { Progress } from '../components/Progress';
import { AlternativeTransport } from '../components/AlternativeTransport';
import { ToastDisplay } from '../components/ToastDisplay';

export function FlightsStep() {
  const { step, setStep, origin, destination, startDate, endDate, travelers, searching, flights, selectedFlight, setSelectedFlight, viewingFlight, setViewingFlight, showToast, ref } = useTrip();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ToastDisplay />
      <Progress current={1} steps={['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo']} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep('plan')}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h2 className="text-xl font-bold">Voos: {origin} → {destination}</h2><p className="text-sm text-muted-foreground">{startDate} a {endDate} • {travelers} viajante{parseInt(travelers) > 1 ? 's' : ''}</p></div>
      </div>
      {searching ? (
        <div className="phantom-card p-16 text-center"><Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" /><p className="text-xl font-semibold">Buscando voos...</p></div>
      ) : flights.length === 0 ? (
        <AlternativeTransport origin={origin} destination={destination} onBack={() => setStep('plan')} onSkip={() => setStep('hotels')} distances={ref?.distances || {}} fuel={ref?.fuel || { consumption: 12, price: 5.89, tollPerKm: 0.35 }} />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {flights.slice(0, 12).map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`phantom-card p-5 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all ${selectedFlight?.id === f.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => { setSelectedFlight(f); showToast(`${f.airline} selecionado!`); }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">{f.flightNumber || f.airline.substring(0, 3).toUpperCase()}</span>
                  {f.stops === 'Direto' && <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">DIRETO</span>}
                </div>
                <p className="text-sm font-bold mb-1">{f.airline}</p>
                <p className="text-xs text-muted-foreground mb-3">{f.origin} → {f.destination} • {f.duration}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{f.duration}</div>
                  <p className="text-lg font-bold">{formatCurrency(f.price)}</p>
                </div>
                {selectedFlight?.id === f.id && <div className="mt-2 flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" /> Selecionado</div>}
              </motion.div>
            ))}
          </div>
          {selectedFlight && (
            <Button onClick={() => setStep('hotels')} className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              Continuar para Hotéis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </>
      )}
      <AnimatePresence>
        {viewingFlight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={() => setViewingFlight(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
              className="relative w-full max-w-lg bg-card border-l shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold">Detalhes do Voo</h3>
                <button onClick={() => setViewingFlight(null)} className="p-2 hover:bg-muted rounded-xl"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-80 mb-3">{viewingFlight.airline}</p>
                  <div className="flex items-center justify-between"><p className="text-3xl font-bold">{viewingFlight.origin}</p><div className="flex-1 mx-4 border-t border-dashed border-white/30" /><p className="text-3xl font-bold">{viewingFlight.destination}</p></div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <span className="text-sm opacity-80">⏱ {viewingFlight.duration} • 🔄 {viewingFlight.stops}</span>
                    <p className="text-2xl font-bold">{formatCurrency(viewingFlight.price)}</p>
                  </div>
                </div>
                {viewingFlight.deepLink && <Button className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => window.open(viewingFlight.deepLink, '_blank')}><ExternalLink className="mr-2 h-4 w-4" /> Reservar Agora</Button>}
                <Button variant="outline" className="w-full rounded-xl" onClick={() => { setSelectedFlight(viewingFlight); setViewingFlight(null); showToast('Voo selecionado!'); }}><Check className="mr-2 h-4 w-4" /> Selecionar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
