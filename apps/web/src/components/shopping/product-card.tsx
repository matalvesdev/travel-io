'use client';

import * as React from 'react';
import { Heart, ExternalLink, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  store: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  cashback?: number;
  url?: string;
}

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
  onCompare?: (product: Product) => void;
}

export function ProductCard({ product, onAdd, onCompare }: ProductCardProps) {
  const price = product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const discount = originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <span className="text-muted-foreground text-xs">Foto</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium line-clamp-1">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.store}</p>
              </div>
              {discount > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              {originalPrice > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
            </div>

            {product.cashback && product.cashback > 0 && (
              <div className="mt-1 flex items-center gap-1 text-sm text-success">
                <TrendingDown className="h-4 w-4" />
                {product.cashback}% cashback
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onAdd?.(product)}>
                <Heart className="mr-1 h-4 w-4" /> Wishlist
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCompare?.(product)}>
                Comparar
              </Button>
              {product.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" /> Loja
                  </a>
                </Button>
              )}
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
