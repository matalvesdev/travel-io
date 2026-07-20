import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

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
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const [transactionsRes, investmentsRes, goalsRes, tripsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
      supabase.from('investments').select('quantity,avg_cost,current_price').eq('user_id', userId),
      supabase.from('goals').select('current_amount,target_amount,status').eq('user_id', userId),
      supabase.from('trips').select('id,status').eq('user_id', userId),
    ]);

    const errors = [transactionsRes, investmentsRes, goalsRes, tripsRes].find((r) => r.error);
    if (errors?.error) return Response.json({ success: false, message: errors.error.message }, { status: 500 });

    const isIncome = (t: any) => (t.type || '').toUpperCase() === 'INCOME';
    const isExpense = (t: any) => (t.type || '').toUpperCase() === 'EXPENSE';

    const tx = transactionsRes.data || [];

    const totalRevenue = tx.filter(isIncome).reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = tx.filter(isExpense).reduce((sum, t) => sum + Number(t.amount), 0);
    const totalInvested = (investmentsRes.data || []).reduce((sum, t) => sum + Number(t.quantity) * Number(t.avg_cost), 0);
    const totalPortfolio = (investmentsRes.data || []).reduce((sum, t) => sum + Number(t.quantity) * Number(t.current_price), 0);
    const totalGoals = (goalsRes.data || []).length;
    const completedGoals = (goalsRes.data || []).filter((g) => g.status === 'completed').length;
    const tripsPlanned = (tripsRes.data || []).filter((t) => t.status === 'planned').length;
    const tripsCompleted = (tripsRes.data || []).filter((t) => t.status === 'completed').length;

    const categoryMap = tx.filter(isExpense).reduce<Record<string, number>>((acc, t) => {
      const cat = t.category_name || t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});
    const barData = Object.entries(categoryMap).map(([name, expense]) => {
      const income = tx.filter((t) => isIncome(t) && (t.category_name === name || t.category === name)).reduce((s, t) => s + Number(t.amount), 0);
      return { name, Receita: income, Despesa: expense };
    });

    // Category breakdown for donut chart
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

    // Cash flow trend (last 6 months)
    const now = new Date();
    const cashFlowTrend: CashFlowChartData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
      const monthTx = tx.filter(t => {
        const txDate = t.transaction_date || t.date || '';
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
        transactions: tx.slice(0, 10).map((t) => ({
          id: t.id, description: t.description, amount: Number(t.amount), type: isIncome(t) ? 'INCOME' as const : 'EXPENSE' as const, date: t.transaction_date || t.date})),
      }});
  });
}
