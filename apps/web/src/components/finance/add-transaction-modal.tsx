'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateTransaction } from '@/hooks/api/use-finance';

const CATEGORIES = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
  'Lazer', 'Pets', 'Casa', 'Trabalho', 'Vestuário', 'Dívidas', 'Outros',
];

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const createTransaction = useCreateTransaction();
  const [type, setType] = React.useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('PIX');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    if (!date) newErrors.date = 'Data é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createTransaction.mutate({
      type,
      description: description.trim(),
      amount: Math.abs(parseFloat(amount)),
      transactionDate: date,
      categoryId: category || undefined,
      note: notes || undefined,
      paymentMethod: paymentMethod || undefined,
      accountId: '',
    }, {
      onSuccess: () => {
        resetForm();
        onClose();
      },
    });
  };

  const resetForm = () => {
    setType('EXPENSE');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setNotes('');
    setPaymentMethod('PIX');
    setErrors({});
  };

  React.useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nova Transação</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        {/* Type Toggle */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tipo</label>
          <div className="flex gap-2">
            <Button variant={type === 'EXPENSE' ? 'default' : 'outline'} onClick={() => setType('EXPENSE')} className="flex-1">
              <TrendingDown className="mr-2 h-4 w-4" /> Despesa
            </Button>
            <Button variant={type === 'INCOME' ? 'default' : 'outline'} onClick={() => setType('INCOME')} className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" /> Receita
            </Button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1 block">Descrição</label>
          <Input value={description} onChange={e => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }} placeholder="Ex: Netflix, Supermercado..." />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
          <Input type="number" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: '' })); }} placeholder="0,00" />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium mb-1 block">Data</label>
          <Input type="date" value={date} onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }} />
          {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-1 block">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Selecionar categoria</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-sm font-medium mb-1 block">Método de Pagamento</label>
          <div className="flex gap-2">
            {['PIX', 'Crédito', 'Débito', 'Boleto'].map(method => (
              <button key={method} onClick={() => setPaymentMethod(method)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${paymentMethod === method ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações adicionais..." />
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          disabled={createTransaction.isPending}>
          {createTransaction.isPending ? (
            <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Adicionando...</>
          ) : (
            <><Check className="mr-2 h-4 w-4" /> Adicionar Transação</>
          )}
        </Button>
      </div>
    </div>
  );
}
