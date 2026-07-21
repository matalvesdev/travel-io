'use client';

import * as React from 'react';
import { z } from 'zod';
import { DollarSign, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { Goal } from '@/lib/api';

const contributionSchema = z.object({
  amount: z.number().positive('Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionModalProps {
  goal: Goal;
  onSave: (data: ContributionFormData) => void;
  onClose: () => void;
}

export function ContributionModal({ goal, onSave, onClose }: ContributionModalProps) {
  const [formData, setFormData] = React.useState<ContributionFormData>({
    amount: goal.monthlyContribution || 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const target = goal.targetAmount || 0;
  const current = goal.currentAmount || 0;
  const remaining = Math.max(0, target - current);

  const handleSubmit = async () => {
    const result = contributionSchema.safeParse({
      ...formData,
      amount: Number(formData.amount),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (result.data.amount > remaining) {
      setErrors({ amount: `Valor excede o restante (${formatCurrency(remaining)})` });
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      onSave(result.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-row items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Contribuir para {goal.name}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Atual</span>
              <span className="font-medium">{formatCurrency(current)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meta</span>
              <span className="font-medium">{formatCurrency(target)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1 pt-1 border-t">
              <span className="text-muted-foreground">Restante</span>
              <span className="font-medium text-primary">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Valor (R$) *</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={e => {
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                if (errors.amount) setErrors({ ...errors, amount: '' });
              }}
              placeholder="0,00"
              className={`mt-1 ${errors.amount ? 'border-destructive' : ''}`}
            />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Data *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={e => {
                setFormData({ ...formData, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
              className={`mt-1 ${errors.date ? 'border-destructive' : ''}`}
            />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nota sobre esta contribuição..."
              rows={3}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Registrar Contribuição
          </Button>
        </div>
      </div>
    </div>
  );
}
