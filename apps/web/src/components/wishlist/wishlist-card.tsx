'use client';

import { Plane, Hotel, MapPin, Pencil, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TravelWishlistItem } from '@/types/wishlist';

interface WishlistCardProps {
  item: TravelWishlistItem;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

const typeConfig = {
  flight: { icon: Plane, label: 'Voo', color: 'text-blue-500' },
  hotel: { icon: Hotel, label: 'Hotel', color: 'text-purple-500' },
  destination: { icon: MapPin, label: 'Destino', color: 'text-green-500' },
};

export function WishlistCard({ item, onEdit, onDelete }: WishlistCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {item.type === 'flight' && (
          <>
            {item.origin && item.destination && (
              <p>{item.origin} → {item.destination}</p>
            )}
            {item.airline && <p>{item.airline}{item.flightNumber ? ` • ${item.flightNumber}` : ''}</p>}
            {item.departureDate && <p>Ida: {formatDate(item.departureDate)}</p>}
          </>
        )}

        {item.type === 'hotel' && (
          <>
            {item.hotelName && <p className="font-medium text-foreground">{item.hotelName}</p>}
            {item.hotelAddress && <p>{item.hotelAddress}</p>}
            {item.checkIn && (
              <p>{formatDate(item.checkIn)} → {item.checkOut ? formatDate(item.checkOut) : '...'}</p>
            )}
            {item.nights && <p>{item.nights} noite(s)</p>}
          </>
        )}

        {item.type === 'destination' && (
          <>
            {item.country && <p>{item.country}</p>}
          </>
        )}

        {item.notes && <p className="text-xs italic mt-1">{item.notes}</p>}
      </div>

      {item.targetPrice && (
        <div className="flex items-center gap-1 text-sm">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Preço alvo:</span>
          <span className="font-medium">{formatCurrency(item.targetPrice)}</span>
        </div>
      )}

      <div className="flex justify-end gap-1 pt-2 border-t">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
