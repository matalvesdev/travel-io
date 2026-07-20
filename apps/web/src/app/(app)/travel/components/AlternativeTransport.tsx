'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Plane, Map, Navigation, Car, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function AlternativeTransport({ origin, destination, onBack, onSkip, distances, fuel }: {
  origin: string; destination: string; onBack: () => void; onSkip: () => void;
  distances: Record<string, number>; fuel: { consumption: number; price: number; tollPerKm: number };
}) {
  const key1 = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const key2 = `${destination.toLowerCase()}-${origin.toLowerCase()}`;
  const distKm = distances[key1] || distances[key2] || Math.round(300 + Math.random() * 500);
  const busPrice = Math.round(distKm * 0.12);
  const ownCarFuel = Math.ceil((distKm / fuel.consumption) * fuel.price);
  const ownCarTolls = Math.round(distKm * fuel.tollPerKm);
  const ownCarTotal = ownCarFuel + ownCarTolls;
  const rentalPrice = Math.round(distKm * 0.18);

  const options = [
    { label: 'Carro Próprio', icon: '🚗', price: ownCarTotal, priceLabel: formatCurrency(ownCarTotal), detail: `Combustível ${formatCurrency(ownCarFuel)} + Pedágios ${formatCurrency(ownCarTolls)}`, pros: ['Sem horário', 'Flexibilidade total', 'Conforto'], cons: ['Desgaste do carro', 'Não pode beber', 'Cansaço do motorista'], time: `${Math.ceil(distKm / 90)}h`, best: ownCarTotal <= busPrice && ownCarTotal <= rentalPrice },
    { label: 'Ônibus', icon: '🚌', price: busPrice, priceLabel: formatCurrency(busPrice), detail: `${distKm}km • ~R$0,12/km`, pros: ['Mais barato', 'Sem dirigir', 'Wi-Fi grátis'], cons: ['Horários fixos', 'Menos conforto', 'Demora mais'], time: `${Math.ceil(distKm / 70)}h`, best: busPrice <= ownCarTotal && busPrice <= rentalPrice },
    { label: 'Carro Alugado', icon: '🚙', price: rentalPrice, priceLabel: formatCurrency(rentalPrice), detail: `${distKm}km • Inclui seguro`, pros: ['Carro novo', 'Sem desgaste próprio', 'Liberdade'], cons: ['Mais caro', 'Precisa CNH', 'Limitação km'], time: `${Math.ceil(distKm / 90)}h`, best: rentalPrice <= ownCarTotal && rentalPrice <= busPrice },
  ].sort((a, b) => a.price - b.price);

  const bestOption = options.find(o => o.best) || options[0];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="phantom-card p-8 text-center">
        <Plane className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1">Nenhum voo encontrado</h3>
        <p className="text-sm text-muted-foreground mb-1">{origin} → {destination} • ~{distKm}km</p>
        <p className="text-sm text-muted-foreground">Mas temos outras opções de transporte para você!</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((opt, i) => (
          <motion.div key={opt.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`phantom-card p-5 ${opt.best ? 'ring-2 ring-green-500 bg-green-500/5' : ''}`}>
            {opt.best && <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full mb-2 inline-block">MELHOR CUSTO-BENEFÍCIO</span>}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{opt.icon}</span>
              <div><p className="font-bold">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.time} de viagem</p></div>
            </div>
            <p className="text-2xl font-bold text-primary mb-1">{opt.priceLabel}</p>
            <p className="text-xs text-muted-foreground mb-3">{opt.detail}</p>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-green-600">Vantagens:</p>
              {opt.pros.map(p => <p key={p} className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="text-green-500">✓</span>{p}</p>)}
              <p className="text-[11px] font-semibold text-red-500 mt-1">Desvantagens:</p>
              {opt.cons.map(c => <p key={c} className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="text-red-400">✗</span>{c}</p>)}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="phantom-card p-5">
        <h4 className="font-bold text-sm mb-3">🔗 Links Úteis</h4>
        <div className="grid gap-2 md:grid-cols-3">
          <a href={`https://www.google.com/maps/dir/${origin}/${destination}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-xl border hover:bg-muted/30 transition-colors text-sm">
            <Map className="h-4 w-4 text-blue-500" />Rota no Google Maps
          </a>
          <a href={`https://www.clickbus.com.br/onibus/${origin.toLowerCase().replace(/\s+/g, '-')}/${destination.toLowerCase().replace(/\s+/g, '-')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-xl border hover:bg-muted/30 transition-colors text-sm">
            <Navigation className="h-4 w-4 text-green-500" />Passagens no ClickBus
          </a>
          <a href={`https://www.booking.com/cars/index.html?ss=${encodeURIComponent(destination)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-xl border hover:bg-muted/30 transition-colors text-sm">
            <Car className="h-4 w-4 text-amber-500" />Alugar Carro no Booking
          </a>
        </div>
      </div>
      <div className="phantom-card p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-white" /></div>
          <div>
            <p className="text-sm font-bold text-green-700">Melhor opção: {bestOption.label}</p>
            <p className="text-xs text-green-600">{bestOption.priceLabel} • ~{bestOption.time} de viagem • {bestOption.pros[0]}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 py-5 rounded-xl" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        <Button className="flex-1 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white" onClick={onSkip}><Hotel className="mr-2 h-4 w-4" /> Buscar Só Hotéis</Button>
      </div>
    </motion.div>
  );
}
