'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, MapPin, Calendar, Users, Plane, Building2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFlightSearchTrigger, useHotelSearchTrigger, useCreateTrip } from '@/hooks/api/use-travel';
import { FlightResults } from '@/components/travel/flight-results';
import { HotelResults } from '@/components/travel/hotel-results';
import { toast } from 'sonner';

type Step = 'plan' | 'flights' | 'hotels' | 'confirm';

interface SearchModalProps {
  onClose: () => void;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function SearchModal({ onClose }: SearchModalProps) {
  const [step, setStep] = React.useState<Step>('plan');
  const [direction, setDirection] = React.useState(1);
  const [plan, setPlan] = React.useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
  });
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null);
  const [selectedHotel, setSelectedHotel] = React.useState<any>(null);

  const flightSearch = useFlightSearchTrigger();
  const hotelSearch = useHotelSearchTrigger();
  const createTrip = useCreateTrip();

  const steps: Step[] = ['plan', 'flights', 'hotels', 'confirm'];
  const stepIndex = steps.indexOf(step);

  const goTo = (next: Step) => {
    const nextIdx = steps.indexOf(next);
    setDirection(nextIdx > stepIndex ? 1 : -1);
    setStep(next);
  };

  const handlePlanSearch = () => {
    if (!plan.origin || !plan.destination || !plan.departureDate) {
      toast.error('Preencha origem, destino e data de ida');
      return;
    }
    flightSearch.search({
      origin: plan.origin,
      destination: plan.destination,
      departureDate: plan.departureDate,
      adults: plan.travelers,
    });
    goTo('flights');
  };

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight);
    if (plan.returnDate) {
      hotelSearch.search({
        destination: plan.destination,
        checkIn: plan.departureDate,
        checkOut: plan.returnDate,
        guests: plan.travelers,
      });
    }
    goTo('hotels');
  };

  const handleHotelSelect = (hotel: any) => {
    setSelectedHotel(hotel);
    goTo('confirm');
  };

  const handleSaveTrip = async () => {
    try {
      await createTrip.mutateAsync({
        name: `${plan.origin} → ${plan.destination}`,
        destination: plan.destination,
        startDate: plan.departureDate,
        endDate: plan.returnDate || plan.departureDate,
        notes: `Voo: ${selectedFlight?.airline || ''} ${selectedFlight?.flightNumber || ''} | Hotel: ${selectedHotel?.name || ''}`,
      });
      toast.success('Viagem salva com sucesso!');
      onClose();
    } catch {
      toast.error('Erro ao salvar viagem');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-background shadow-xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 border-b px-6 py-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i === stepIndex ? 'font-medium' : 'text-muted-foreground'}`}>
                {s === 'plan' ? 'Planejar' : s === 'flights' ? 'Voos' : s === 'hotels' ? 'Hotéis' : 'Confirmar'}
              </span>
              {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="relative min-h-[400px] overflow-y-auto p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {step === 'plan' && (
                <PlanStep plan={plan} setPlan={setPlan} onSearch={handlePlanSearch} />
              )}
              {step === 'flights' && (
                <FlightsStep
                  flights={flightSearch.data?.flights || []}
                  isLoading={flightSearch.isLoading}
                  onSelect={handleFlightSelect}
                  onBack={() => goTo('plan')}
                />
              )}
              {step === 'hotels' && (
                <HotelsStep
                  hotels={hotelSearch.data?.hotels || []}
                  isLoading={hotelSearch.isLoading}
                  onSelect={handleHotelSelect}
                  onBack={() => goTo('flights')}
                />
              )}
              {step === 'confirm' && (
                <ConfirmStep
                  plan={plan}
                  flight={selectedFlight}
                  hotel={selectedHotel}
                  onSave={handleSaveTrip}
                  isSaving={createTrip.isPending}
                  onBack={() => goTo('hotels')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// === Sub-steps ===

function PlanStep({
  plan,
  setPlan,
  onSearch,
}: {
  plan: any;
  setPlan: (p: any) => void;
  onSearch: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Planeje sua viagem</h2>
        <p className="text-muted-foreground">Informe os detalhes para buscar voos e hotéis</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            <MapPin className="mr-1 inline h-4 w-4" />
            Origem (IATA)
          </label>
          <Input
            value={plan.origin}
            onChange={(e) => setPlan({ ...plan, origin: e.target.value.toUpperCase() })}
            placeholder="Ex: GRU"
            maxLength={3}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            <MapPin className="mr-1 inline h-4 w-4" />
            Destino (IATA)
          </label>
          <Input
            value={plan.destination}
            onChange={(e) => setPlan({ ...plan, destination: e.target.value.toUpperCase() })}
            placeholder="Ex: CDG"
            maxLength={3}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            <Calendar className="mr-1 inline h-4 w-4" />
            Data de ida
          </label>
          <Input
            type="date"
            value={plan.departureDate}
            onChange={(e) => setPlan({ ...plan, departureDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            <Calendar className="mr-1 inline h-4 w-4" />
            Data de volta
          </label>
          <Input
            type="date"
            value={plan.returnDate}
            onChange={(e) => setPlan({ ...plan, returnDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            <Users className="mr-1 inline h-4 w-4" />
            Viajantes
          </label>
          <Input
            type="number"
            min={1}
            max={9}
            value={plan.travelers}
            onChange={(e) => setPlan({ ...plan, travelers: Number(e.target.value) || 1 })}
          />
        </div>
      </div>
      <Button onClick={onSearch} className="w-full" size="lg">
        <Plane className="mr-2 h-4 w-4" />
        Buscar Voos
      </Button>
    </div>
  );
}

function FlightsStep({
  flights,
  isLoading,
  onSelect,
  onBack,
}: {
  flights: any[];
  isLoading: boolean;
  onSelect: (f: any) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Voos encontrados</h2>
          <p className="text-muted-foreground">{flights.length} opção(ões) disponível(is)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <FlightResults flights={flights} isLoading={isLoading} onSelect={onSelect} />
    </div>
  );
}

function HotelsStep({
  hotels,
  isLoading,
  onSelect,
  onBack,
}: {
  hotels: any[];
  isLoading: boolean;
  onSelect: (h: any) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hotéis encontrados</h2>
          <p className="text-muted-foreground">{hotels.length} opção(ões) disponível(is)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <HotelResults hotels={hotels} isLoading={isLoading} onSelect={onSelect} />
    </div>
  );
}

function ConfirmStep({
  plan,
  flight,
  hotel,
  onSave,
  isSaving,
  onBack,
}: {
  plan: any;
  flight: any;
  hotel: any;
  onSave: () => void;
  isSaving: boolean;
  onBack: () => void;
}) {
  const totalCost = (flight?.price || 0) * plan.travelers + (hotel?.price || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Confirmar viagem</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="space-y-4">
        {/* Route */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{plan.origin} → {plan.destination}</p>
              <p className="text-sm text-muted-foreground">
                {plan.departureDate}{plan.returnDate ? ` — ${plan.returnDate}` : ''} | {plan.travelers} viajante(s)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flight */}
        {flight && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Plane className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{flight.airline} — {flight.flightNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {flight.departure && new Date(flight.departure).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {' → '}
                  {flight.arrival && new Date(flight.arrival).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {flight.duration && ` (${flight.duration})`}
                  {flight.stops === 0 ? ' — Direto' : ` — ${flight.stops} escala(s)`}
                </p>
              </div>
              <p className="text-right font-semibold">
                {formatCurrency(flight.price * plan.travelers)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Hotel */}
        {hotel && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{hotel.name}</p>
                <p className="text-sm text-muted-foreground">
                  ⭐ {hotel.rating} | {hotel.address}
                </p>
              </div>
              <p className="text-right font-semibold">
                {formatCurrency(hotel.price)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Total */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-lg font-semibold">Total estimado</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onSave} className="w-full" size="lg" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Salvar Viagem
          </>
        )}
      </Button>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
