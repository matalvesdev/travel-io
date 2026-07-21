'use client';

import * as React from 'react';
import { Plane, Clock, ArrowRight, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FlightSearchResult } from '@/hooks/api/use-travel';

interface FlightResultsProps {
  flights: FlightSearchResult[];
  isLoading: boolean;
  onSelect: (flight: FlightSearchResult) => void;
  selected?: string;
}

type SortBy = 'price' | 'duration';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function parseDuration(dur: string): number {
  const match = dur.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return 0;
  return (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
}

export function FlightResults({ flights, isLoading, onSelect, selected }: FlightResultsProps) {
  const [sortBy, setSortBy] = React.useState<SortBy>('price');

  const sorted = React.useMemo(() => {
    const list = [...flights];
    if (sortBy === 'price') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'duration') list.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    return list;
  }, [flights, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Plane className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-muted-foreground">Nenhum voo encontrado para esta busca.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Ordenar:</span>
        <Button
          variant={sortBy === 'price' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('price')}
        >
          Preço
        </Button>
        <Button
          variant={sortBy === 'duration' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('duration')}
        >
          Duração
        </Button>
      </div>

      {/* Flight list */}
      {sorted.map(flight => (
        <Card
          key={flight.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selected === flight.id ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
          onClick={() => onSelect(flight)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{flight.airline}</p>
                  <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{flight.origin}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <div className="h-px w-8 bg-muted-foreground/25" />
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {flight.duration}
                    </div>
                    <div className="h-px w-8 bg-muted-foreground/25" />
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <span className="text-lg font-semibold">{flight.destination}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {flight.departure && new Date(flight.departure).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>→</span>
                  <span>
                    {flight.arrival && new Date(flight.arrival).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatCurrency(flight.price)}</p>
                <Badge variant={flight.stops === 0 ? 'success' : 'secondary'} className="mt-1">
                  {flight.stops === 0 ? 'Direto' : `${flight.stops} escala(s)`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
