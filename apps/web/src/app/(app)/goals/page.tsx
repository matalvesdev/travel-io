'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Car, Plane, Shield, Laptop, Home, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { goalsApi } from '@/lib/api';

const iconMap: Record<string, React.ElementType> = {
  car: Car, plane: Plane, shield: Shield, laptop: Laptop, home: Home, target: Target,
};

export default function GoalsPage() {
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({ name: '', targetAmount: '', monthlyContribution: '', type: 'SAVINGS', priority: 'MEDIUM' });

  const [goals, setGoals] = React.useState<any[]>([]);

  const fetchGoals = React.useCallback(async () => {
    try {
      const res = await goalsApi.getGoals();
      if (res.success) setGoals(res.data?.goals || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    setCreating(true);
    try {
      await goalsApi.createGoal({
        name: newGoal.name,
        type: newGoal.type,
        targetAmount: parseFloat(newGoal.targetAmount),
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: newGoal.monthlyContribution ? parseFloat(newGoal.monthlyContribution) : undefined,
        priority: newGoal.priority,
      });
      setShowAddModal(false);
      setNewGoal({ name: '', targetAmount: '', monthlyContribution: '', type: 'SAVINGS', priority: 'MEDIUM' });
      fetchGoals();
    } catch { /* empty */ }
    setCreating(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalTarget = goals.reduce((a, g) => a + (g.targetAmount || g.target || 0), 0);
  const totalCurrent = goals.reduce((a, g) => a + (g.currentAmount || g.current || 0), 0);
  const avgProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Objetivos</h1>
          <p className="text-muted-foreground">Acompanhe suas metas financeiras</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />Novo Objetivo
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div whileHover={{ y: -1 }} className="phantom-card"><div className="p-6">
          <p className="text-sm text-muted-foreground">Total de Metas</p>
          <p className="text-2xl font-bold">{goals.length}</p>
        </div></motion.div>
        <motion.div whileHover={{ y: -1 }} className="phantom-card"><div className="p-6">
          <p className="text-sm text-muted-foreground">Progresso Geral</p>
          <p className="text-2xl font-bold text-primary">{Math.round(avgProgress)}%</p>
        </div></motion.div>
        <motion.div whileHover={{ y: -1 }} className="phantom-card"><div className="p-6">
          <p className="text-sm text-muted-foreground">Total Acumulado</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalCurrent)}</p>
        </div></motion.div>
        <motion.div whileHover={{ y: -1 }} className="phantom-card"><div className="p-6">
          <p className="text-sm text-muted-foreground">Meta Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
        </div></motion.div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="phantom-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum objetivo criado ainda</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />Criar Primeiro Objetivo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, i) => {
            const target = goal.targetAmount || goal.target || 0;
            const current = goal.currentAmount || goal.current || 0;
            const pct = target > 0 ? (current / target) * 100 : 0;
            const remaining = target - current;
            const monthly = goal.monthlyContribution || goal.monthly || 0;
            const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
            const Icon = iconMap[goal.icon || 'target'] || Target;
            const color = goal.color || '#3B82F6';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -1 }}
              >
                <div className="phantom-card relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{ backgroundColor: color }} />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: color + '20' }}>
                          <Icon className="h-6 w-6" style={{ color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            goal.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' :
                            goal.priority === 'HIGH' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>{goal.priority}</span>
                        </div>
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
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
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
                        <p className="font-medium">{formatCurrency(remaining > 0 ? remaining : 0)}</p>
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
                        <p className={`font-medium ${goal.isOnTrack !== false ? 'text-primary' : 'text-warning'}`}>
                          {goal.isCompleted ? 'Concluído' : goal.isOnTrack !== false ? 'No prazo' : 'Atrasado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="phantom-card-elevated w-full max-w-md mx-4">
            <div className="flex flex-row items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Novo Objetivo
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} placeholder="Ex: Comprar carro" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Valor alvo (R$)</label>
                <Input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })} placeholder="50000" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Contribuição mensal (R$)</label>
                <Input type="number" value={newGoal.monthlyContribution} onChange={e => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })} placeholder="2500" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select value={newGoal.type} onChange={e => setNewGoal({ ...newGoal, type: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="SAVINGS">Poupança</option>
                  <option value="INVESTMENT">Investimento</option>
                  <option value="TRAVEL">Viagem</option>
                  <option value="PURCHASE">Compra</option>
                  <option value="EMERGENCY">Reserva de Emergência</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <div className="flex gap-2 mt-1">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                    <Button key={p} variant={newGoal.priority === p ? 'default' : 'outline'} size="sm" onClick={() => setNewGoal({ ...newGoal, priority: p })}>
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddGoal} className="w-full" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Criar Objetivo
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
