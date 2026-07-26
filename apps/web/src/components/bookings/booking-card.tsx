'use client';

import * as React from 'react';
import { Plane, Hotel, Edit2, Trash2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/types/booking';

interface BookingCardProps {
  booking: Booking;
  onEdit: () => void;
  onCancel: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

export function BookingCard({ booking, onEdit, onCancel }: BookingCardProps) {
  const isFlight = booking.type === 'flight';

  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${isFlight ? 'bg-blue-100' : 'bg-purple-100'}`}>
            {isFlight ? (
              <Plane className={`h-5 w-5 ${isFlight ? 'text-blue-600' : 'text-purple-600'}`} />
            ) : (
              <Hotel className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium">
              {isFlight
                ? `${booking.airline || 'Voo'} ${booking.flightNumber || ''}`
                : booking.hotelName || 'Hotel'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isFlight
                ? `${booking.origin || ''} → ${booking.destination || ''}`
                : booking.hotelAddress || ''}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {isFlight ? (
          <>
            {booking.departureDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(booking.departureDate).toLocaleDateString('pt-BR')}
                {booking.departureTime && ` ${booking.departureTime}`}
              </div>
            )}
            {booking.arrivalDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(booking.arrivalDate).toLocaleDateString('pt-BR')}
                {booking.arrivalTime && ` ${booking.arrivalTime}`}
              </div>
            )}
          </>
        ) : (
          <>
            {booking.checkIn && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Check-in: {new Date(booking.checkIn).toLocaleDateString('pt-BR')}
              </div>
            )}
            {booking.checkOut && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Check-out: {new Date(booking.checkOut).toLocaleDateString('pt-BR')}
              </div>
            )}
            {booking.nights && (
              <div className="text-muted-foreground">
                {booking.nights} {booking.nights === 1 ? 'noite' : 'noites'}
              </div>
            )}
            {booking.roomType && (
              <div className="text-muted-foreground">{booking.roomType}</div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Code & Price */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          {booking.confirmationCode && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm font-mono">
              {booking.confirmationCode}
            </span>
          )}
        </div>
        {booking.price && (
          <span className="font-medium">
            {booking.currency === 'BRL' ? 'R$' : booking.currency === 'USD' ? '$' : '€'}
            {Number(booking.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="mr-1 h-3 w-3" />
          Editar
        </Button>
        {booking.status !== 'cancelled' && (
          <Button variant="outline" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-1 h-3 w-3" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
