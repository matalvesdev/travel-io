'use client';

import * as React from 'react';
import { Gift, Clock, ExternalLink, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MilesPromotion } from '@/lib/api';

interface PromotionsListProps {
  promotions: MilesPromotion[];
}

const PROGRAM_COLORS: Record<string, string> = {
  SMILES: '#0066CC',
  LIVELO: '#FF6B00',
  LATAM_PASS: '#E31837',
  AZUL_FIDELIDADE: '#0057B8',
};

const CATEGORY_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  partner: 'Parceiro',
  season: 'Sazonal',
  loyalty: 'Fidelidade',
  transfer: 'Transferência',
};

export function PromotionsList({ promotions }: PromotionsListProps) {
  if (promotions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Promoções Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Gift className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhuma promoção ativa no momento</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Volte depois para conferir novidades</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Promoções Ativas
          <span className="ml-auto text-sm font-normal text-muted-foreground">{promotions.length} promoções</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {promotions.map((promo) => {
          const color = PROGRAM_COLORS[promo.program] || '#6366f1';
          const daysLeft = promo.validUntil ? Math.ceil((new Date(promo.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
          const isUrgent = daysLeft <= 7;

          return (
            <div
              key={promo.id}
              className="group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md"
            >
              <div className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10" style={{ backgroundColor: color }} />
              <div className="relative flex items-start gap-3">
                <div className="shrink-0 rounded-lg p-2" style={{ backgroundColor: `${color}15` }}>
                  <Gift className="h-5 w-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                      {promo.program}
                    </span>
                    {promo.bonusPercentage > 0 && (
                      <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                        +{promo.bonusPercentage}%
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-sm mb-1">{promo.title}</h4>
                  {promo.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{promo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-1 ${isUrgent ? 'text-amber-600 font-medium' : ''}`}>
                      <Clock className="h-3 w-3" />
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expira hoje'}
                    </span>
                  </div>
                </div>
                {promo.link && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => window.open(promo.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
