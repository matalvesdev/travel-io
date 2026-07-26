'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BudgetCard } from './budget-card';
import type { BudgetWithSpent, BudgetSummary } from '@/types/budget';

interface BudgetOverviewProps {
  summary?: BudgetSummary;
  budgets: BudgetWithSpent[];
  isLoading: boolean;
  onAddBudget: () => void;
  onEditBudget: (budget: BudgetWithSpent) => void;
  onDeleteBudget: (id: string) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getStatusColor(status: 'safe' | 'warning' | 'danger') {
  switch (status) {
    case 'safe': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'danger': return 'text-red-600';
  }
}

export function BudgetOverview({
  summary,
  budgets,
  isLoading,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
}: BudgetOverviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">Nenhum orçamento definido para este mês</p>
        <Button onClick={onAddBudget}>
          <Plus className="mr-2 h-4 w-4" />
          Criar primeiro orçamento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Orçamento total</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Gasto total</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.status)}`}>
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
          </div>
          <Progress
            value={Math.min(summary.percentage, 100)}
            className={`h-3 ${summary.status === 'danger' ? 'bg-red-100' : summary.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}
          />
          <div className="flex justify-between mt-2">
            <span className={`text-sm font-medium ${getStatusColor(summary.status)}`}>
              {summary.percentage.toFixed(1)}% utilizado
            </span>
            <span className="text-sm text-muted-foreground">
              {summary.totalBudget - summary.totalSpent > 0
                ? `${formatCurrency(summary.totalBudget - summary.totalSpent)} restantes`
                : `${formatCurrency(summary.totalSpent - summary.totalBudget)} acima do limite`}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <Button onClick={onAddBudget} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => (
          <BudgetCard
            key={b.id}
            budget={b}
            onEdit={() => onEditBudget(b)}
            onDelete={() => onDeleteBudget(b.id)}
          />
        ))}
      </div>
    </div>
  );
}
