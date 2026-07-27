'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { WishlistItemType, TravelWishlistItem } from '@/types/wishlist';

interface WishlistFormProps {
  item?: TravelWishlistItem;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TYPES: { value: WishlistItemType; label: string }[] = [
  { value: 'flight', label: 'Voo' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'destination', label: 'Destino' },
];

export function WishlistForm({ item, onSubmit, onCancel, isLoading }: WishlistFormProps) {
  const [type, setType] = React.useState<WishlistItemType>(item?.type || 'flight');
  const [name, setName] = React.useState(item?.name || '');
  const [notes, setNotes] = React.useState(item?.notes || '');
  const [targetPrice, setTargetPrice] = React.useState(item?.targetPrice?.toString() || '');
  const [error, setError] = React.useState('');

  const [origin, setOrigin] = React.useState(item?.origin || '');
  const [destination, setDestination] = React.useState(item?.destination || '');
  const [airline, setAirline] = React.useState(item?.airline || '');
  const [flightNumber, setFlightNumber] = React.useState(item?.flightNumber || '');
  const [departureDate, setDepartureDate] = React.useState(item?.departureDate?.split('T')[0] || '');

  const [hotelName, setHotelName] = React.useState(item?.hotelName || '');
  const [hotelAddress, setHotelAddress] = React.useState(item?.hotelAddress || '');
  const [checkIn, setCheckIn] = React.useState(item?.checkIn?.split('T')[0] || '');
  const [checkOut, setCheckOut] = React.useState(item?.checkOut?.split('T')[0] || '');
  const [nights, setNights] = React.useState(item?.nights?.toString() || '');
  const [roomType, setRoomType] = React.useState(item?.roomType || '');

  const [country, setCountry] = React.useState(item?.country || '');
  const [imageUrl, setImageUrl] = React.useState(item?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    const data: Record<string, unknown> = {
      type,
      name: name.trim(),
    };

    if (notes.trim()) data.notes = notes.trim();
    if (targetPrice) data.targetPrice = parseFloat(targetPrice);

    if (type === 'flight') {
      if (origin.trim()) data.origin = origin.trim();
      if (destination.trim()) data.destination = destination.trim();
      if (airline.trim()) data.airline = airline.trim();
      if (flightNumber.trim()) data.flightNumber = flightNumber.trim();
      if (departureDate) data.departureDate = departureDate;
    } else if (type === 'hotel') {
      if (hotelName.trim()) data.hotelName = hotelName.trim();
      if (hotelAddress.trim()) data.hotelAddress = hotelAddress.trim();
      if (checkIn) data.checkIn = checkIn;
      if (checkOut) data.checkOut = checkOut;
      if (nights) data.nights = parseInt(nights, 10);
      if (roomType.trim()) data.roomType = roomType.trim();
    } else if (type === 'destination') {
      if (country.trim()) data.country = country.trim();
      if (imageUrl.trim()) data.imageUrl = imageUrl.trim();
    }

    if (item?.id) data.id = item.id;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type">Tipo</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as WishlistItemType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="name">Nome *</label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: GRU-JFK" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="targetPrice">Preço alvo (R$)</label>
        <Input id="targetPrice" type="number" step="0.01" min="0" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Ex: 2500" />
      </div>

      {type === 'flight' && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Detalhes do Voo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="origin">Origem</label>
              <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex: GRU" />
            </div>
            <div className="space-y-2">
              <label htmlFor="destination">Destino</label>
              <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: JFK" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="airline">Companhia</label>
              <Input id="airline" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Ex: LATAM" />
            </div>
            <div className="space-y-2">
              <label htmlFor="flightNumber">Número do voo</label>
              <Input id="flightNumber" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="Ex: LA8080" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="departureDate">Data de ida</label>
            <Input id="departureDate" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'hotel' && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Detalhes do Hotel</h4>
          <div className="space-y-2">
            <label htmlFor="hotelName">Nome do hotel</label>
            <Input id="hotelName" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Ex: Hilton São Paulo" />
          </div>
          <div className="space-y-2">
            <label htmlFor="hotelAddress">Endereço</label>
            <Input id="hotelAddress" value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} placeholder="Ex: Av. Paulista, 1000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="checkIn">Check-in</label>
              <Input id="checkIn" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="checkOut">Check-out</label>
              <Input id="checkOut" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="nights">Noites</label>
              <Input id="nights" type="number" min="1" value={nights} onChange={(e) => setNights(e.target.value)} placeholder="Ex: 3" />
            </div>
            <div className="space-y-2">
              <label htmlFor="roomType">Tipo de quarto</label>
              <Input id="roomType" value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="Ex: Luxo" />
            </div>
          </div>
        </div>
      )}

      {type === 'destination' && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Detalhes do Destino</h4>
          <div className="space-y-2">
            <label htmlFor="country">País</label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex: Japão" />
          </div>
          <div className="space-y-2">
            <label htmlFor="imageUrl">URL da imagem</label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Ex: https://..." />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Observações adicionais..."
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}
