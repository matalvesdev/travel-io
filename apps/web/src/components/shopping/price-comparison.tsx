'use client';

import * as React from 'react';
import { TrendingDown, ExternalLink, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PriceOption {
  store: string;
  price: number;
  url?: string;
  cashback?: number;
  inStock: boolean;
}

interface PriceComparisonProps {
  productName: string;
  options: PriceOption[];
  onSelect?: (option: PriceOption) => void;
}

export function PriceComparison({ productName, options, onSelect }: PriceComparisonProps) {
  const sortedOptions = [...options].sort((a, b) => a.price - b.price);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparar Preços</CardTitle>
        <p className="text-sm text-muted-foreground">{productName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedOptions.map((option, i) => {
            const isLowest = option.price === sortedOptions[0]?.price;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 transition-colors',
                  isLowest && 'border-success bg-success/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    isLowest ? 'bg-success/10' : 'bg-muted'
                  )}>
                    {isLowest ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{option.store}</p>
                    {option.cashback && option.cashback > 0 && (
                      <p className="text-xs text-success">{option.cashback}% cashback</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn('font-semibold', isLowest && 'text-success')}>
                      {formatCurrency(option.price)}
                    </p>
                    {!option.inStock && (
                      <p className="text-xs text-destructive">Indisponível</p>
                    )}
                  </div>
                  {option.url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={option.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
