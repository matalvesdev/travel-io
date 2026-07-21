'use client';

import * as React from 'react';
import { z } from 'zod';
import { Target, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Goal } from '@/lib/api';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['SAVINGS', 'INVESTMENT', 'TRAVEL', 'CUSTOM']),
  targetAmount: z.number().positive('Valor alvo deve ser maior que zero'),
  monthlyContribution: z.number().nonnegative().optional(),
  targetDate: z.string().min(1, 'Data alvo é obrigatória'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface AddGoalModalProps {
  goal?: Goal | null;
  onSave: (data: GoalFormData) => void;
  onClose: () => void;
}

const TYPE_OPTIONS = [
  { value: 'SAVINGS', label: 'Poupança' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'TRAVEL', label: 'Viagem' },
  { value: 'CUSTOM', label: 'Personalizado' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

export function AddGoalModal({ goal, onSave, onClose }: AddGoalModalProps) {
  const [formData, setFormData] = React.useState<GoalFormData>({
    name: goal?.name || '',
    type: (goal?.type as GoalFormData['type']) || 'SAVINGS',
    targetAmount: goal?.targetAmount || 0,
    monthlyContribution: goal?.monthlyContribution || 0,
    targetDate: goal?.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: (goal?.priority as GoalFormData['priority']) || 'MEDIUM',
    description: goal?.description || '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async () => {
    const result = goalSchema.safeParse({
      ...formData,
      targetAmount: Number(formData.targetAmount),
      monthlyContribution: formData.monthlyContribution ? Number(formData.monthlyContribution) : undefined,
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

    setErrors({});
    setSaving(true);
    try {
      onSave(result.data);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof GoalFormData>(key: K, value: GoalFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-row items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Nome *</label>
            <Input
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Ex: Comprar carro"
              className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <div className="flex gap-2 mt-1">
              {TYPE_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={formData.type === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('type', opt.value as GoalFormData['type'])}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Valor alvo (R$) *</label>
            <Input
              type="number"
              value={formData.targetAmount || ''}
              onChange={e => updateField('targetAmount', parseFloat(e.target.value) || 0)}
              placeholder="50000"
              className={`mt-1 ${errors.targetAmount ? 'border-destructive' : ''}`}
            />
            {errors.targetAmount && <p className="text-xs text-destructive mt-1">{errors.targetAmount}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Contribuição mensal (R$)</label>
            <Input
              type="number"
              value={formData.monthlyContribution || ''}
              onChange={e => updateField('monthlyContribution', parseFloat(e.target.value) || 0)}
              placeholder="2500"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data alvo *</label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={e => updateField('targetDate', e.target.value)}
              className={`mt-1 ${errors.targetDate ? 'border-destructive' : ''}`}
            />
            {errors.targetDate && <p className="text-xs text-destructive mt-1">{errors.targetDate}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Prioridade</label>
            <div className="flex gap-2 mt-1">
              {PRIORITY_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={formData.priority === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('priority', opt.value as GoalFormData['priority'])}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={formData.description || ''}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Descreva sua meta..."
              rows={3}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {goal ? 'Salvar Alterações' : 'Criar Meta'}
          </Button>
        </div>
      </div>
    </div>
  );
}
