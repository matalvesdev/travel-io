'use client';

import * as React from 'react';
import { Award, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MilesProgram {
  name: string;
  balance: number;
  expiring: number;
  color: string;
  conversionRate: number;
}

interface ProgramCardProps {
  program: MilesProgram;
  onConvert?: (program: MilesProgram) => void;
}

export function ProgramCard({ program, onConvert }: ProgramCardProps) {
  const monetaryValue = program.balance * program.conversionRate;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundColor: program.color }} />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: program.color }} />
          {program.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-2xl font-bold">{program.balance.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">milhas</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor estimado</p>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(monetaryValue)}
            </p>
          </div>
        </div>

        {program.expiring > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              {program.expiring.toLocaleString('pt-BR')} milhas expiram em 30 dias
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onConvert?.(program)}>
            Converter
          </Button>
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
