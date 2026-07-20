'use client';

import * as React from 'react';
import { Star, MapPin, Wifi, Coffee, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Hotel {
  id: string;
  name: string;
  address: string;
  price: number;
  originalPrice?: number;
  rating: number;
  amenities: string[];
  promo?: string;
  cashback?: number;
  reviews?: number;
}

interface HotelCardProps {
  hotel: Hotel;
  onSelect?: (hotel: Hotel) => void;
}

const amenityIcons: { [key: string]: React.ElementType } = {
  'WiFi': Wifi,
  'Café da manhã': Coffee,
  'Academia': Dumbbell,
};

export function HotelCard({ hotel, onSelect }: HotelCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
      {hotel.promo && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {hotel.promo}
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Placeholder image */}
          <div className="h-32 w-32 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Foto</span>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {hotel.address}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{hotel.rating}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 3).map((amenity) => (
                <span key={amenity} className="rounded-full bg-muted px-2 py-1 text-xs">
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs text-muted-foreground">+{hotel.amenities.length - 3} mais</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                {hotel.originalPrice && hotel.originalPrice > hotel.price && (
                  <p className="text-sm text-muted-foreground line-through">{formatCurrency(hotel.originalPrice)}</p>
                )}
                <p className="text-2xl font-bold text-primary">{formatCurrency(hotel.price)}</p>
                <p className="text-xs text-muted-foreground">por noite</p>
                {hotel.cashback && hotel.cashback > 0 && (
                  <p className="text-xs text-success">{hotel.cashback}% cashback</p>
                )}
                {hotel.reviews && (
                  <p className="text-xs text-muted-foreground mt-1">{hotel.reviews.toLocaleString('pt-BR')} avaliações</p>
                )}
              </div>
              <Button size="sm" onClick={() => onSelect?.(hotel)}>
                Reservar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
