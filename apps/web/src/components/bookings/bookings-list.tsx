'use client';

import * as React from 'react';
import { Plane, Hotel, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingCard } from './booking-card';
import type { Booking } from '@/types/booking';

interface BookingsListProps {
  bookings: Booking[];
  tripId: string;
  onCreateNew: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  isLoading?: boolean;
}

export function BookingsList({ bookings, tripId, onCreateNew, onEdit, onCancel, isLoading }: BookingsListProps) {
  const flightBookings = bookings.filter(b => b.type === 'flight');
  const hotelBookings = bookings.filter(b => b.type === 'hotel');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhuma reserva registrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Registre suas reservas de voos e hotéis para acompanhar sua viagem.
        </p>
        <Button onClick={onCreateNew} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Registrar primeira reserva
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flight Bookings */}
      {flightBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium">Voos ({flightBookings.length})</h3>
          </div>
          <div className="space-y-3">
            {flightBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={() => onEdit(booking)}
                onCancel={() => onCancel(booking)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hotel Bookings */}
      {hotelBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hotel className="h-4 w-4 text-purple-600" />
            <h3 className="font-medium">Hotéis ({hotelBookings.length})</h3>
          </div>
          <div className="space-y-3">
            {hotelBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={() => onEdit(booking)}
                onCancel={() => onCancel(booking)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add New Button */}
      <Button variant="outline" onClick={onCreateNew} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar reserva
      </Button>
    </div>
  );
}
