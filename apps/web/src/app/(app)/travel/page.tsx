'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Calendar, DollarSign, Plus, Search, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTrips, useFlightSearchTrigger, useHotelSearchTrigger } from '@/hooks/api/use-travel';
import { useCreateTrip } from '@/hooks/api/use-travel';
import { MetricCard } from '@/components/analytics/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TripCard } from '@/components/travel/trip-card';
import { SearchModal } from '@/components/travel/search-modal';
import { formatCurrency } from '@/lib/utils';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusStats(trips: any[] | undefined) {
  if (!trips) return { total: 0, upcoming: 0, completed: 0, planned: 0, ongoing: 0 };
  const now = new Date();
  return {
    total: trips.length,
    upcoming: trips.filter(t => new Date(t.startDate) > now && t.status === 'planejada').length,
    completed: trips.filter(t => t.status === 'concluida' || t.status === 'completed').length,
    planned: trips.filter(t => t.status === 'planejada' || t.status === 'planned').length,
    ongoing: trips.filter(t => t.status === 'em andamento' || t.status === 'ongoing').length,
  };
}

function getNextTrip(trips: any[] | undefined) {
  if (!trips || trips.length === 0) return null;
  const now = new Date();
  const upcoming = trips
    .filter(t => new Date(t.startDate) > now && (t.status === 'planejada' || t.status === 'planned' || t.status === 'em andamento' || t.status === 'ongoing'))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  return upcoming[0] || null;
}

export default function TravelPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const { data: tripsResponse, isLoading } = useTrips();
  const trips = tripsResponse?.trips;
  const stats = getStatusStats(trips);
  const nextTrip = getNextTrip(trips);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Viagens</h1>
          <p className="text-muted-foreground">Planeje e acompanhe suas viagens</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Viagem
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Viagens"
          value={String(stats.total)}
          icon={Plane}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Próximas"
          value={String(stats.upcoming || stats.planned)}
          icon={Clock}
          iconColor="text-orange-500"
        />
        <MetricCard
          title="Concluídas"
          value={String(stats.completed)}
          icon={CheckCircle2}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Em Andamento"
          value={String(stats.ongoing)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
      </div>

      {/* Next Trip Card */}
      {nextTrip && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Próxima Viagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{nextTrip.destination || nextTrip.name}</h3>
                <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(nextTrip.startDate)} — {formatDate(nextTrip.endDate)}
                  </span>
                  {nextTrip.totalCost > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(nextTrip.totalCost)}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {nextTrip.status === 'planejada' || nextTrip.status === 'planned' ? 'Planejada' : 'Em andamento'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trips Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Todas as Viagens</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onClick={() => {}} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Plane className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma viagem ainda</h3>
            <p className="mt-2 text-muted-foreground">Clique em "Nova Viagem" para planejar sua primeira viagem.</p>
            <Button className="mt-4" onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Viagem
            </Button>
          </Card>
        )}
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {modalOpen && (
          <SearchModal onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
