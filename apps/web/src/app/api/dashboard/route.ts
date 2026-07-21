import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

interface CategoryChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface CashFlowChartData {
  month: string;
  income: number;
  expenses: number;
}

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const [transactions, investments, goals, trips] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.investment.findMany({
        where: { userId },
        select: { quantity: true, avgCost: true, currentPrice: true },
      }),
      prisma.goal.findMany({
        where: { userId },
        select: { currentAmount: true, targetAmount: true, status: true },
      }),
      prisma.trip.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
    ]);

    const isIncome = (t: { type: string }) => t.type.toUpperCase() === 'INCOME';
    const isExpense = (t: { type: string }) => t.type.toUpperCase() === 'EXPENSE';

    const totalRevenue = transactions.filter(isIncome).reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(isExpense).reduce((sum, t) => sum + Number(t.amount), 0);
    const totalInvested = investments.reduce((sum, t) => sum + Number(t.quantity) * Number(t.avgCost), 0);
    const totalPortfolio = investments.reduce((sum, t) => sum + Number(t.quantity) * Number(t.currentPrice), 0);
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const tripsPlanned = trips.filter((t) => t.status === 'planned').length;
    const tripsCompleted = trips.filter((t) => t.status === 'completed').length;

    const categoryMap = transactions.filter(isExpense).reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

    const barData = Object.entries(categoryMap).map(([name, expense]) => {
      const income = transactions
        .filter((t) => isIncome(t) && t.category === name)
        .reduce((s, t) => s + Number(t.amount), 0);
      return { name, Receita: income, Despesa: expense };
    });

    const CATEGORY_COLORS: Record<string, string> = {
      'Alimentação': '#f97316',
      'Moradia': '#8b5cf6',
      'Transporte': '#3b82f6',
      'Saúde': '#10b981',
      'Educação': '#06b6d4',
      'Lazer': '#ec4899',
      'Pets': '#f59e0b',
      'Casa': '#6366f1',
      'Trabalho': '#14b8a6',
      'Vestuário': '#e11d48',
      'Dívidas': '#ef4444',
      'Outros': '#6b7280',
    };

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
        color: CATEGORY_COLORS[name] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);

    const now = new Date();
    const cashFlowTrend: CashFlowChartData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
      const monthTx = transactions.filter((t) => {
        const txDate = t.date ? new Date(t.date).toISOString().slice(0, 7) : '';
        return txDate.startsWith(yearMonth);
      });
      const income = monthTx.filter(isIncome).reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = monthTx.filter(isExpense).reduce((sum, t) => sum + Number(t.amount), 0);
      cashFlowTrend.push({ month: monthLabel, income, expenses });
    }

    return Response.json({
      success: true,
      data: {
        financialSummary: { totalRevenue, totalExpenses, balance: totalRevenue - totalExpenses, totalInvested, totalPortfolio },
        goals: { total: totalGoals, completed: completedGoals },
        trips: { planned: tripsPlanned, completed: tripsCompleted },
        barData,
        categoryBreakdown,
        cashFlowTrend,
        transactions: transactions.slice(0, 10).map((t) => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          type: isIncome(t) ? 'INCOME' as const : 'EXPENSE' as const,
          date: t.date,
        })),
      },
    });
  });
}
