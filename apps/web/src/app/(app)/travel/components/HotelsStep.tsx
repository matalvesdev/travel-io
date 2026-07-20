'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, SlidersHorizontal, Loader2, Search, Star, MapPin, Check, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useTrip } from '../contexts/TripContext';
import { Progress } from '../components/Progress';
import { ToastDisplay } from '../components/ToastDisplay';

export function HotelsStep() {
  const { setStep, destination, nights, travelers, searching, hotels, filteredHotels, selectedHotel, setSelectedHotel, hotelStarFilter, setHotelStarFilter, hotelPriceMax, setHotelPriceMax, hotelSortBy, setHotelSortBy, showToast, searchHotels } = useTrip();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ToastDisplay />
      <Progress current={2} steps={['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo']} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep('flights')}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h2 className="text-xl font-bold">Hotéis em {destination}</h2><p className="text-sm text-muted-foreground">{nights} noite{nights > 1 ? 's' : ''} • {travelers} viajante{parseInt(travelers) > 1 ? 's' : ''}</p></div>
      </div>
      {hotels.length === 0 && !searching && <Button onClick={searchHotels} className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"><Search className="mr-2 h-5 w-5" /> Buscar Hotéis</Button>}
      {searching && <div className="phantom-card p-16 text-center"><Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" /><p className="text-xl font-semibold">Buscando hotéis...</p></div>}
      {hotels.length > 0 && (
        <>
          <div className="phantom-card p-4">
            <div className="flex items-center gap-2 mb-3"><SlidersHorizontal className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Filtros</span><span className="text-xs text-muted-foreground ml-auto">{filteredHotels.length} resultados</span></div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Estrelas:</label>
                <div className="flex gap-1">
                  {[0, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setHotelStarFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${hotelStarFilter === s ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
                      {s === 0 ? 'Todas' : `${s}★+`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Preço máx:</label>
                <input type="range" min={0} max={Math.max(...hotels.map(h => h.price), 1000)} step={50} value={hotelPriceMax} onChange={e => setHotelPriceMax(Number(e.target.value))} className="w-32" />
                <span className="text-xs font-medium">{formatCurrency(hotelPriceMax)}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Ordenar:</label>
                <select value={hotelSortBy} onChange={e => setHotelSortBy(e.target.value as 'price' | 'rating')} className="rounded-lg border bg-background px-2 py-1 text-xs">
                  <option value="price">Menor preço</option>
                  <option value="rating">Melhor nota</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.slice(0, 12).map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`phantom-card overflow-hidden cursor-pointer hover:shadow-lg transition-all ${selectedHotel?.id === h.id ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''}`}
                onClick={() => { setSelectedHotel(h); showToast(`${h.name} selecionado!`); }}>
                {h.imageUrl ? (
                  <div className="h-40 relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                    <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {h.rating > 0 && <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{h.rating.toFixed(1)}</div>}
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center relative">
                    <Hotel className="h-14 w-14 text-amber-200" />
                    {h.rating > 0 && <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{h.rating.toFixed(1)}</div>}
                  </div>
                )}
                <div className="p-4">
                  <p className="font-semibold text-sm mb-1 line-clamp-1">{h.name}</p>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{h.address}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{formatCurrency(h.price)}<span className="text-xs text-muted-foreground">/noite</span></p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(h.price * nights)} total</p>
                  </div>
                  {selectedHotel?.id === h.id && <div className="mt-2 flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" /> Selecionado</div>}
                </div>
              </motion.div>
            ))}
          </div>
          {selectedHotel && (
            <Button onClick={() => setStep('confirm')} className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              Confirmar Dados <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </>
      )}
    </motion.div>
  );
}
