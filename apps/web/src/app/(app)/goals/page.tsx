'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useAddGoalProgress } from '@/hooks/api/use-goals';
import { GoalCard } from '@/components/goals/goal-card';
import { AddGoalModal } from '@/components/goals/add-goal-modal';
import { ContributionModal } from '@/components/goals/contribution-modal';
import type { Goal } from '@/lib/api';

export default function GoalsPage() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = React.useState<Goal | null>(null);

  const { data: goalsData, isLoading } = useGoals();
  const goals = goalsData?.goals || [];
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addProgress = useAddGoalProgress();

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const inProgressGoals = totalGoals - completedGoals;

  const handleSaveGoal = (data: { name: string; type: string; targetAmount: number; monthlyContribution?: number; targetDate: string; priority: string; description?: string }) => {
    if (editingGoal) {
      updateGoal.mutate(
        { id: editingGoal.id, ...data },
        { onSuccess: () => { setShowAddModal(false); setEditingGoal(null); } }
      );
    } else {
      createGoal.mutate(data, {
        onSuccess: () => { setShowAddModal(false); },
      });
    }
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate(id);
  };

  const handleContribution = (data: { amount: number; date: string; notes?: string }) => {
    if (!contributingGoal) return;
    addProgress.mutate(
      { goalId: contributingGoal.id, amount: data.amount, description: data.notes },
      { onSuccess: () => { setContributingGoal(null); } }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Objetivos</h1>
          <p className="text-muted-foreground">Acompanhe suas metas financeiras</p>
        </div>
        <Button onClick={() => { setEditingGoal(null); setShowAddModal(true); }}>
          <Plus className="mr-2 h-4 w-4" />Nova Meta
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div whileHover={{ y: -1 }} className="phantom-card">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Total de Metas</p>
            <p className="text-2xl font-bold">{totalGoals}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -1 }} className="phantom-card">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-bold text-primary">{inProgressGoals}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -1 }} className="phantom-card">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold text-success">{completedGoals}</p>
          </div>
        </motion.div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="phantom-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma meta criada ainda</p>
            <Button className="mt-4" onClick={() => { setEditingGoal(null); setShowAddModal(true); }}>
              <Plus className="mr-2 h-4 w-4" />Criar Primeira Meta
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GoalCard
                goal={goal}
                onEdit={(g) => { setEditingGoal(g); setShowAddModal(true); }}
                onDelete={handleDeleteGoal}
                onContribute={(g) => setContributingGoal(g)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <AddGoalModal
          goal={editingGoal}
          onSave={handleSaveGoal}
          onClose={() => { setShowAddModal(false); setEditingGoal(null); }}
        />
      )}

      {/* Contribution Modal */}
      {contributingGoal && (
        <ContributionModal
          goal={contributingGoal}
          onSave={handleContribution}
          onClose={() => setContributingGoal(null)}
        />
      )}
    </motion.div>
  );
}
