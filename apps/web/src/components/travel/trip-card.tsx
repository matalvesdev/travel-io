'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, DollarSign, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Trip } from '@/hooks/api/use-travel';

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'planejada':
    case 'planned':
      return { label: 'Planejada', variant: 'secondary' as const };
    case 'em andamento':
    case 'ongoing':
      return { label: 'Em andamento', variant: 'success' as const };
    case 'concluida':
    case 'completed':
      return { label: 'Concluída', variant: 'outline' as const };
    default:
      return { label: status, variant: 'outline' as const };
  }
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const statusConfig = getStatusConfig(trip.status);
  const daysUntil = Math.ceil(
    (new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
        onClick={onClick}
      >
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
        <CardContent className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{trip.name || trip.destination}</h3>
                <p className="text-sm text-muted-foreground">{trip.destination}</p>
              </div>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>

          {/* Dates */}
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </span>
            {daysUntil > 0 && daysUntil <= 365 && (
              <Badge variant="outline" className="ml-auto text-xs">
                {daysUntil}d
              </Badge>
            )}
          </div>

          {/* Cost */}
          {trip.totalCost > 0 && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(trip.totalCost)}</span>
            </div>
          )}

          {/* Flight & Hotel Summary */}
          {(trip as any).flights?.length > 0 || (trip as any).hotels?.length > 0 ? (
            <div className="mt-3 border-t pt-3">
              <div className="flex gap-3 text-xs text-muted-foreground">
                {(trip as any).flights?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Plane className="h-3 w-3" />
                    {(trip as any).flights.length} voo(s)
                  </span>
                )}
                {(trip as any).hotels?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {(trip as any).hotels.length} hotel(is)
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
