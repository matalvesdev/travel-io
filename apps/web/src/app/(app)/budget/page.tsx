'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetOverview } from '@/components/budget/budget-overview';
import { BudgetForm } from '@/components/budget/budget-form';
import { useBudgets, useBudgetSummary, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/api/use-budget';
import type { BudgetWithSpent, CreateBudgetInput } from '@/types/budget';

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const [showForm, setShowForm] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<BudgetWithSpent | null>(null);

  const { data: budgets, isLoading } = useBudgets(month, year);
  const { data: summary } = useBudgetSummary(month, year);
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const budgetList = budgets || [];

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEditBudget = (budget: BudgetWithSpent) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDeleteBudget = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;
    deleteBudget.mutate(id);
  };

  const handleSubmit = (data: CreateBudgetInput) => {
    if (editingBudget) {
      updateBudget.mutate(
        { id: editingBudget.id, limit: data.limit },
        { onSuccess: () => { setShowForm(false); setEditingBudget(null); } }
      );
    } else {
      createBudget.mutate(data, {
        onSuccess: () => { setShowForm(false); },
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Controle seus gastos por categoria</p>
        </div>
        <Button onClick={handleAddBudget}>
          <Plus className="mr-2 h-4 w-4" />Novo Orçamento
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={prevMonth}>&larr;</Button>
        <span className="text-lg font-medium">
          {new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="outline" size="sm" onClick={nextMonth}>&rarr;</Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <BudgetForm
            budget={editingBudget || undefined}
            month={month}
            year={year}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createBudget.isPending || updateBudget.isPending}
          />
        </div>
      )}

      <BudgetOverview
        summary={summary}
        budgets={budgetList}
        isLoading={isLoading}
        onAddBudget={handleAddBudget}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    </motion.div>
  );
}
