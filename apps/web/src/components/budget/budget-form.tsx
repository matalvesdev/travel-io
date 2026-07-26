'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { BudgetWithSpent, CreateBudgetInput } from '@/types/budget';

const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Assinaturas', 'Serviços', 'Outros',
];

interface BudgetFormProps {
  budget?: BudgetWithSpent;
  month: number;
  year: number;
  onSubmit: (data: CreateBudgetInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BudgetForm({ budget, month, year, onSubmit, onCancel, isLoading }: BudgetFormProps) {
  const [category, setCategory] = React.useState(budget?.category || '');
  const [limit, setLimit] = React.useState(budget?.limit?.toString() || '');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category) {
      setError('Selecione uma categoria');
      return;
    }

    const limitValue = parseFloat(limit);
    if (!limit || isNaN(limitValue) || limitValue <= 0) {
      setError('Limite deve ser maior que zero');
      return;
    }

    onSubmit({ category, limit: limitValue, month, year });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecione...</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Limite (R$)</label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="1500,00"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {budget ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
