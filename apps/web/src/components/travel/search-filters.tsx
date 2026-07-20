'use client';

import * as React from 'react';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps {
  type: 'flights' | 'hotels';
  onSearch: (params: any) => void;
}

export function SearchFilters({ type, onSearch }: SearchFiltersProps) {
  const [params, setParams] = React.useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    guests: '2',
  });

  const handleSearch = () => {
    onSearch(params);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          {type === 'flights' && (
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Origem
              </label>
              <Input
                value={params.origin}
                onChange={e => setParams({ ...params, origin: e.target.value })}
                placeholder="Ex: GRU"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Destino
            </label>
            <Input
              value={params.destination}
              onChange={e => setParams({ ...params, destination: e.target.value })}
              placeholder={type === 'flights' ? 'Ex: CDG' : 'Ex: Paris'}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {type === 'flights' ? 'Ida' : 'Check-in'}
            </label>
            <Input
              type="date"
              value={params.startDate}
              onChange={e => setParams({ ...params, startDate: e.target.value })}
              className="mt-1"
            />
          </div>

          {type === 'hotels' && (
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Volta
              </label>
              <Input
                type="date"
                value={params.endDate}
                onChange={e => setParams({ ...params, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          )}

          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
