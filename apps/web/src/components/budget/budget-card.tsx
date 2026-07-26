'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { BudgetWithSpent } from '@/types/budget';

interface BudgetCardProps {
  budget: BudgetWithSpent;
  onEdit: () => void;
  onDelete: () => void;
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

function getProgressColor(status: 'safe' | 'warning' | 'danger') {
  switch (status) {
    case 'safe': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'danger': return 'bg-red-500';
  }
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min(budget.percentage, 100);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{budget.category}</h3>
        <span className={`text-sm font-semibold ${getStatusColor(budget.status)}`}>
          {budget.percentage.toFixed(1)}%
        </span>
      </div>

      <Progress value={percentage} className={`h-2 ${getProgressColor(budget.status)}`} />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatCurrency(budget.spent)} gastos</span>
        <span>{formatCurrency(budget.remaining)} restantes</span>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs text-muted-foreground">
          Limite: {formatCurrency(budget.limit)}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
