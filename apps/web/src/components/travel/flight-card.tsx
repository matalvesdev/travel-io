'use client';

import * as React from 'react';
import { Plane, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  originalPrice?: number;
  duration: string;
  stops: number;
  promo?: string;
  cashback?: number;
}

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
      {flight.promo && (
        <div className="absolute top-2 right-2 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {flight.promo}
        </div>
      )}
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
          <div className="text-right">
            {flight.originalPrice && flight.originalPrice > flight.price && (
              <p className="text-sm text-muted-foreground line-through">{formatCurrency(flight.originalPrice)}</p>
            )}
            <p className="text-2xl font-bold text-primary">{formatCurrency(flight.price)}</p>
            <p className="text-xs text-muted-foreground">por pessoa</p>
            {flight.cashback && flight.cashback > 0 && (
              <p className="text-xs text-success">{flight.cashback}% cashback</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-center">
            <p className="font-semibold">{flight.origin}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(flight.departure).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center px-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-muted-foreground/25" />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {flight.duration}
              </div>
              <div className="h-px flex-1 bg-muted-foreground/25" />
            </div>
            <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-center">
            <p className="font-semibold">{flight.destination}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(flight.arrival).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {flight.stops === 0 ? 'Direto' : `${flight.stops} escala(s)`}
          </span>
          <Button size="sm" onClick={() => onSelect?.(flight)}>
            Selecionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
