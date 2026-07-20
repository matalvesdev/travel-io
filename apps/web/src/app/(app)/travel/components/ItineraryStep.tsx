'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane, Hotel, Map, Coffee, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useTrip } from '../contexts/TripContext';
import { Progress } from '../components/Progress';
import { ToastDisplay } from '../components/ToastDisplay';

export function ItineraryStep() {
  const { setStep, destination, startDate, itinerary, itineraryDay, setItineraryDay, handleSaveTrip } = useTrip();

  const uniqueDays = [...new Set(itinerary.map(i => i.day))];
  const dayItems = itinerary.filter(i => i.day === itineraryDay);

  const itemIconMap: Record<string, any> = { travel: Plane, hotel: Hotel, activity: Map, food: Coffee };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ToastDisplay />
      <Progress current={4} steps={['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo']} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep('confirm')}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h2 className="text-xl font-bold">Roteiro: {destination}</h2><p className="text-sm text-muted-foreground">{itinerary.length} atividades planejadas</p></div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {uniqueDays.map(d => {
          const dayDate = startDate ? new Date(new Date(startDate).getTime() + (d - 1) * 86400000) : null;
          const dateStr = dayDate ? dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';
          return (<button key={d} onClick={() => setItineraryDay(d)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${itineraryDay === d ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 'bg-card hover:bg-muted/50'}`}>
            <div className="flex items-center gap-2"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${itineraryDay === d ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>{d}</span><div className="text-left"><p className="text-xs font-bold">Dia {d}</p><p className={`text-[10px] ${itineraryDay === d ? 'text-white/70' : 'text-muted-foreground'}`}>{dateStr}</p></div></div>
          </button>);
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
          <div className="space-y-4">
            {dayItems.map((item, i) => {
              const ItemIcon = itemIconMap[item.type] || Map;
              return (
                <motion.div key={`${item.day}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                  <div className={`absolute -left-5 top-4 w-3 h-3 rounded-full border-2 ${item.type === 'food' ? 'bg-amber-500 border-amber-200' : item.type === 'hotel' ? 'bg-blue-500 border-blue-200' : item.type === 'travel' ? 'bg-purple-500 border-purple-200' : 'bg-green-500 border-green-200'} z-10`} />
                  <div className="phantom-card p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0"><ItemIcon className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-primary font-semibold">{item.time}</span>{item.duration && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.duration}</span>}</div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                        {item.cost && <p className="text-xs font-medium text-green-600 mt-1">{item.cost}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <div className="phantom-card p-5"><h4 className="text-sm font-bold mb-3">Resumo Dia {itineraryDay}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-xl bg-muted/30"><p className="text-lg font-bold">{dayItems.filter(i => i.type === 'activity').length}</p><p className="text-[10px] text-muted-foreground">Atrações</p></div>
              <div className="text-center p-2 rounded-xl bg-muted/30"><p className="text-lg font-bold">{dayItems.filter(i => i.type === 'food').length}</p><p className="text-[10px] text-muted-foreground">Refeições</p></div>
              <div className="text-center p-2 rounded-xl bg-muted/30"><p className="text-lg font-bold">{dayItems.filter(i => i.type === 'travel').length}</p><p className="text-[10px] text-muted-foreground">Trajetos</p></div>
            </div>
            <div className="mt-3 space-y-1">{dayItems.map((item, i) => (<div key={i} className="flex items-center gap-2 text-xs"><span className="w-12 font-mono text-primary">{item.time}</span><span className="truncate text-muted-foreground">{item.title}</span></div>))}</div>
          </div>
          <div className="space-y-3">
            <Button className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl" onClick={handleSaveTrip}><Save className="mr-2 h-4 w-4" /> Salvar Viagem</Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setStep('plan')}><Search className="mr-2 h-4 w-4" /> Nova Busca</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
