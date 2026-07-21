'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Target, Car, Plane, Shield, Laptop, Home, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Goal } from '@/lib/api';

const iconMap: Record<string, React.ElementType> = {
  car: Car, plane: Plane, shield: Shield, laptop: Laptop, home: Home, target: Target,
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const target = goal.targetAmount || 0;
  const current = goal.currentAmount || 0;
  const pct = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const monthly = goal.monthlyContribution || 0;
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const Icon = iconMap[goal.icon?.toLowerCase() || 'target'] || Target;
  const color = goal.color || '#3B82F6';

  const priorityColor = goal.priority === 'URGENT' ? 'bg-destructive/10 text-destructive'
    : goal.priority === 'HIGH' ? 'bg-warning/10 text-warning'
    : goal.priority === 'MEDIUM' ? 'bg-primary/10 text-primary'
    : 'bg-muted text-muted-foreground';

  return (
    <motion.div whileHover={{ y: -1 }} className="phantom-card relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundColor: color }} />
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: color + '20' }}>
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold">{goal.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${priorityColor}`}>
                {PRIORITY_LABELS[goal.priority] || goal.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            {showConfirmDelete ? (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => { onDelete(goal.id); setShowConfirmDelete(false); }}>
                  Confirmar
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{Math.round(pct)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(current)}</span>
            <span>{formatCurrency(target)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Restante</p>
            <p className="font-medium">{formatCurrency(remaining)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Previsão</p>
            <p className="font-medium">{monthsLeft > 0 ? `${monthsLeft} meses` : '—'}</p>
          </div>
          {monthly > 0 && (
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Contribuição/mês</p>
              <p className="font-medium">{formatCurrency(monthly)}</p>
            </div>
          )}
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`font-medium ${goal.isCompleted ? 'text-success' : goal.isOnTrack !== false ? 'text-primary' : 'text-warning'}`}>
              {goal.isCompleted ? 'Concluído' : goal.isOnTrack !== false ? 'No prazo' : 'Atrasado'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onContribute(goal)} disabled={goal.isCompleted}>
            <Plus className="mr-2 h-3 w-3" /> Contribuir
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
