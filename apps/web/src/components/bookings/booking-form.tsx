'use client';

import * as React from 'react';
import { Plane, Hotel, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Booking, CreateBookingInput, BookingType } from '@/types/booking';

interface BookingFormProps {
  booking?: Booking;
  tripId: string;
  onSubmit: (data: CreateBookingInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BookingForm({ booking, tripId, onSubmit, onCancel, isLoading }: BookingFormProps) {
  const [type, setType] = React.useState<BookingType>(booking?.type || 'flight');
  const [confirmationCode, setConfirmationCode] = React.useState(booking?.confirmationCode || '');
  const [notes, setNotes] = React.useState(booking?.notes || '');
  const [price, setPrice] = React.useState(booking?.price?.toString() || '');
  const [currency, setCurrency] = React.useState(booking?.currency || 'BRL');

  // Flight fields
  const [airline, setAirline] = React.useState(booking?.airline || '');
  const [flightNumber, setFlightNumber] = React.useState(booking?.flightNumber || '');
  const [origin, setOrigin] = React.useState(booking?.origin || '');
  const [destination, setDestination] = React.useState(booking?.destination || '');
  const [departureDate, setDepartureDate] = React.useState(booking?.departureDate?.split('T')[0] || '');
  const [arrivalDate, setArrivalDate] = React.useState(booking?.arrivalDate?.split('T')[0] || '');
  const [departureTime, setDepartureTime] = React.useState(booking?.departureTime || '');
  const [arrivalTime, setArrivalTime] = React.useState(booking?.arrivalTime || '');

  // Hotel fields
  const [hotelName, setHotelName] = React.useState(booking?.hotelName || '');
  const [hotelAddress, setHotelAddress] = React.useState(booking?.hotelAddress || '');
  const [checkIn, setCheckIn] = React.useState(booking?.checkIn?.split('T')[0] || '');
  const [checkOut, setCheckOut] = React.useState(booking?.checkOut?.split('T')[0] || '');
  const [nights, setNights] = React.useState(booking?.nights?.toString() || '');
  const [roomType, setRoomType] = React.useState(booking?.roomType || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateBookingInput = {
      type,
      confirmationCode: confirmationCode || undefined,
      notes: notes || undefined,
      price: price ? parseFloat(price) : undefined,
      currency,
    };

    if (type === 'flight') {
      data.airline = airline || undefined;
      data.flightNumber = flightNumber || undefined;
      data.origin = origin || undefined;
      data.destination = destination || undefined;
      data.departureDate = departureDate || undefined;
      data.arrivalDate = arrivalDate || undefined;
      data.departureTime = departureTime || undefined;
      data.arrivalTime = arrivalTime || undefined;
    } else {
      data.hotelName = hotelName || undefined;
      data.hotelAddress = hotelAddress || undefined;
      data.checkIn = checkIn || undefined;
      data.checkOut = checkOut || undefined;
      data.nights = nights ? parseInt(nights) : undefined;
      data.roomType = roomType || undefined;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Type */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === 'flight' ? 'default' : 'outline'}
          onClick={() => setType('flight')}
          className="flex-1"
        >
          <Plane className="mr-2 h-4 w-4" />
          Voo
        </Button>
        <Button
          type="button"
          variant={type === 'hotel' ? 'default' : 'outline'}
          onClick={() => setType('hotel')}
          className="flex-1"
        >
          <Hotel className="mr-2 h-4 w-4" />
          Hotel
        </Button>
      </div>

      {/* Common Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Código de Confirmação</label>
          <Input
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder="ABC123"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Preço</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="flex-1"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Observações</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionais..."
          className="mt-1"
        />
      </div>

      {/* Flight Fields */}
      {type === 'flight' && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Detalhes do Voo</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Companhia Aérea</label>
              <Input
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="LATAM"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Número do Voo</label>
              <Input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="LA1234"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Origem</label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="GRU"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Destino</label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="CDG"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Saída</label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Chegada</label>
              <Input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Horário de Saída</label>
              <Input
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="14:30"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Horário de Chegada</label>
              <Input
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                placeholder="08:15"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hotel Fields */}
      {type === 'hotel' && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Detalhes do Hotel</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nome do Hotel</label>
              <Input
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Hotel Maravilha"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Endereço</label>
              <Input
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                placeholder="Rua das Flores, 123"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-in</label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-out</label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Noites</label>
              <Input
                type="number"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                placeholder="5"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Quarto</label>
              <Input
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="Standard"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {booking ? 'Atualizar' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}
