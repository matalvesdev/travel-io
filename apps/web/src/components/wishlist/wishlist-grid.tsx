'use client';

import { Plus, Loader2, Plane, Hotel, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WishlistCard } from './wishlist-card';
import type { TravelWishlistItem, WishlistItemType } from '@/types/wishlist';

interface WishlistGridProps {
  items: TravelWishlistItem[];
  filter: string;
  isLoading: boolean;
  onFilterChange: (filter: string) => void;
  onAdd: () => void;
  onEdit: (item: TravelWishlistItem) => void;
  onDelete: (id: string) => void;
}

const FILTERS = [
  { value: '', label: 'Todos', icon: Heart },
  { value: 'flight', label: 'Voos', icon: Plane },
  { value: 'hotel', label: 'Hotéis', icon: Hotel },
  { value: 'destination', label: 'Destinos', icon: MapPin },
];

export function WishlistGrid({
  items, filter, isLoading, onFilterChange, onAdd, onEdit, onDelete,
}: WishlistGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered = filter ? items.filter((i) => i.type === filter) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.value;
            return (
              <Button
                key={f.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(f.value)}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                {f.label}
                {!f.value && <span className="ml-1.5 text-xs">({items.length})</span>}
              </Button>
            );
          })}
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Adicionar
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Heart className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {filter
              ? `Nenhum item encontrado em "${FILTERS.find(f => f.value === filter)?.label}"`
              : 'Nenhum item na wishlist'}
          </p>
          {!filter && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
