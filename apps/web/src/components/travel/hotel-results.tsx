'use client';

import * as React from 'react';
import { Building2, Star, MapPin, Wifi, Coffee, Dumbbell, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HotelSearchResult } from '@/hooks/api/use-travel';

interface HotelResultsProps {
  hotels: HotelSearchResult[];
  isLoading: boolean;
  onSelect: (hotel: HotelSearchResult) => void;
  selected?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  'Café da manhã': Coffee,
  'Cafe da manha': Coffee,
  Academia: Dumbbell,
};

export function HotelResults({ hotels, isLoading, onSelect, selected }: HotelResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-muted-foreground">Nenhum hotel encontrado para esta busca.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {hotels.map(hotel => (
        <Card
          key={hotel.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selected === hotel.id ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
          onClick={() => onSelect(hotel)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image placeholder */}
              <div className="h-28 w-28 flex-shrink-0 rounded-lg bg-muted">
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {hotel.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{hotel.rating}</span>
                  </div>
                </div>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hotel.amenities.slice(0, 4).map(amenity => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {Icon && <Icon className="h-3 w-3" />}
                          {amenity}
                        </span>
                      );
                    })}
                    {hotel.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{hotel.amenities.length - 4} mais</span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-primary">{formatCurrency(hotel.price)}</p>
                    <p className="text-xs text-muted-foreground">por noite</p>
                  </div>
                  {selected === hotel.id && (
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      <Check className="h-4 w-4" />
                      Selecionado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
