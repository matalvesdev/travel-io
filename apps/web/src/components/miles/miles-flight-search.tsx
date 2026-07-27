'use client';

import * as React from 'react';
import { Search, Plane, Loader2, Award, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { milesApi } from '@/lib/api';

interface MilesOffer {
  program: string;
  miles: number;
  taxes: number;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  duration: string;
  stops: number;
  cabin: string;
  deepLink: string;
  source: string;
}

const PROGRAM_LABELS: Record<string, string> = {
  SMILES: 'Smiles',
  LATAM_PASS: 'LATAM Pass',
  AZUL: 'Azul Fidelidade',
};

const PROGRAM_COLORS: Record<string, string> = {
  SMILES: 'text-blue-600 bg-blue-500/10 border-blue-200',
  LATAM_PASS: 'text-red-600 bg-red-500/10 border-red-200',
  AZUL: 'text-sky-600 bg-sky-500/10 border-sky-200',
};

function formatMiles(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function MilesFlightSearch() {
  const [origin, setOrigin] = React.useState('GRU');
  const [destination, setDestination] = React.useState('');
  const [date, setDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<MilesOffer[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async () => {
    if (!destination || !date) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await milesApi.scrapeMilesFlights({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
      });
      setResults(res.data?.offers || []);
      if (!res.data?.offers?.length) {
        setError('Nenhuma oferta encontrada para esta rota');
      }
    } catch {
      setError('Erro ao buscar ofertas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Buscar Passagens com Milhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
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
              placeholder="GIG"
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
        </div>

        <Button
          onClick={handleSearch}
          disabled={!destination || !date || loading}
          className="w-full"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</>
          ) : (
            <><Search className="mr-2 h-4 w-4" /> Buscar Milhas</>
          )}
        </Button>

        {error && !loading && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {results.length} oferta{results.length > 1 ? 's' : ''} encontrada{results.length > 1 ? 's' : ''}
            </p>
            {results.map((offer, idx) => (
              <div
                key={`${offer.program}-${idx}`}
                className={`rounded-xl border p-4 ${PROGRAM_COLORS[offer.program] || 'border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    {PROGRAM_LABELS[offer.program] || offer.program}
                  </span>
                  {offer.source === 'estimate' && (
                    <span className="text-xs text-muted-foreground">(estimado)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Plane className="h-3 w-3" />
                  <span>{offer.origin} → {offer.destination}</span>
                  <span>·</span>
                  <span>{offer.stops === 0 ? 'Direto' : `${offer.stops} escala(s)`}</span>
                  {offer.duration && (
                    <><span>·</span><span>{offer.duration}</span></>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatMiles(offer.miles)}</p>
                    <p className="text-xs text-muted-foreground">
                      milhas{offer.taxes > 0 ? ` + R$ ${offer.taxes.toFixed(2)} taxas` : ''}
                    </p>
                  </div>
                  {offer.deepLink && (
                    <a
                      href={offer.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver oferta <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Nenhuma oferta de milhas disponível para esta rota</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
