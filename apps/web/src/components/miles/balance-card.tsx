'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MilesBalanceResponse } from '@/lib/api';

const PROGRAM_COLORS: Record<string, string> = {
  SMILES: '#0066CC',
  smiles: '#0066CC',
  LIVELO: '#FF6B00',
  livelo: '#FF6B00',
  LATAM_PASS: '#E31837',
  latam_pass: '#E31837',
  AZUL_FIDELIDADE: '#0057B8',
  azul_fidelidade: '#0057B8',
};

interface BalanceCardProps {
  data: MilesBalanceResponse;
}

export function BalanceCard({ data }: BalanceCardProps) {
  const { programs, totalMiles, totalExpiring } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo por Programa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.map((program) => {
          const color = PROGRAM_COLORS[program.program] || '#6366f1';
          const maxBalance = Math.max(...programs.map((p) => p.balance), 1);
          const percentage = (program.balance / maxBalance) * 100;

          return (
            <div key={program.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">{program.programName || program.program}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{program.balance.toLocaleString('pt-BR')}</span>
                  <span className="ml-1 text-xs text-muted-foreground">milhas</span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{program.tier}</span>
                <span>~R$ {program.monetaryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          );
        })}

        {totalExpiring > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 mt-4">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-600">Milhas expirando</p>
              <p className="text-muted-foreground">
                {totalExpiring.toLocaleString('pt-BR')} milhas expiram nos próximos 30 dias.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
