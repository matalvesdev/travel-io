'use client';

import * as React from 'react';
import { Calculator, Plane, Hotel, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchFlights } from '@/lib/api/skyscanner';

interface SavingsCalculatorProps {
  totalMiles: number;
  conversionRate?: number;
}

interface PriceComparison {
  cashPrice: number;
  milesNeeded: number;
  milesValue: number;
  savings: number;
  destination: string;
  searchDate: string;
}

const CONVERSION_RATES: Record<string, number> = {
  SMILES: 0.04,
  LIVELO: 0.035,
  LATAM_PASS: 0.038,
  AZUL_FIDELIDADE: 0.032,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function SavingsCalculator({ totalMiles, conversionRate = 0.04 }: SavingsCalculatorProps) {
  const [destination, setDestination] = React.useState('');
  const [origin, setOrigin] = React.useState('GRU');
  const [date, setDate] = React.useState('');
  const [travelers, setTravelers] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PriceComparison | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async () => {
    if (!destination || !date) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const flights = await searchFlights(origin, destination, date, travelers);
      const cashPrice = flights.length > 0 ? flights[0].price : Math.random() * 2000 + 500;
      const milesNeeded = Math.ceil((cashPrice / conversionRate) / 1000) * 1000;
      const milesValue = milesNeeded * conversionRate;

      setResult({
        cashPrice,
        milesNeeded,
        milesValue,
        savings: cashPrice,
        destination: destination.toUpperCase(),
        searchDate: date,
      });
    } catch {
      setError('Erro ao buscar preços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = result ? totalMiles >= result.milesNeeded : false;
  const barCash = result ? Math.max(result.cashPrice, result.milesValue) : 1;
  const barMiles = result ? barCash : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Calculadora de Economia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Origem</label>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              placeholder="GRU"
              className="mt-1"
              maxLength={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Destino</label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              placeholder="CDG"
              className="mt-1"
              maxLength={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Data</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Viajantes</label>
            <Input
              type="number"
              value={travelers}
              onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={9}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={!destination || !date || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculando...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Calcular Economia</>
          )}
        </Button>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {result && (
          <div className="space-y-4 pt-2">
            <div className="text-center text-sm text-muted-foreground">
              {result.destination} em {new Date(result.searchDate).toLocaleDateString('pt-BR')} • {travelers} viajante{travelers > 1 ? 's' : ''}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-destructive/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Preço em Dinheiro</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(result.cashPrice)}</p>
              </div>
              <div className="rounded-xl bg-success/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Preço com Milhas</p>
                <p className="text-xl font-bold text-success">{formatCurrency(0)}</p>
                <p className="text-xs text-muted-foreground">{result.milesNeeded.toLocaleString('pt-BR')} milhas</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço Dinheiro</span>
                <span className="font-medium">{formatCurrency(result.cashPrice)}</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-destructive/60"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo em Milhas</span>
                <span className="font-medium">{formatCurrency(result.milesValue)}</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-success/60"
                  style={{ width: `${(result.milesValue / result.cashPrice) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">Economia Potencial</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(result.savings)}</p>
              <p className="text-xs text-muted-foreground">
                Use {result.milesNeeded.toLocaleString('pt-BR')} milhas para economizar {formatCurrency(result.savings)}
              </p>
            </div>

            <div className={`rounded-lg p-3 text-center text-sm ${canAfford ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'}`}>
              {canAfford
                ? `Você tem milhas suficientes! Saldo: ${totalMiles.toLocaleString('pt-BR')} milhas`
                : `Faltam ${(result.milesNeeded - totalMiles).toLocaleString('pt-BR')} milhas para esta viagem`
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
