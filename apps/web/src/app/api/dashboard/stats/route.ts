import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'MONTH';

    const monthFilter = period === 'MONTH' ? 'current_month' : period === 'YEAR' ? 'current_year' : null;

    let txQuery = supabase
      .from('transactions')
      .select('amount,type,category_name,transaction_date')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(50);

    if (monthFilter === 'current_month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      txQuery = txQuery.gte('transaction_date', start);
    } else if (monthFilter === 'current_year') {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1).toISOString();
      txQuery = txQuery.gte('transaction_date', start);
    }

    const [txRes, goalsRes, investmentsRes, tripsRes] = await Promise.all([
      txQuery,
      supabase.from('goals').select('current_amount,target_amount,status,name').eq('user_id', userId),
      supabase.from('investments').select('quantity,avg_cost,current_price').eq('user_id', userId),
      supabase.from('trips').select('id,status').eq('user_id', userId),
    ]);

    const errors = [txRes, goalsRes, investmentsRes, tripsRes].find((r) => r.error);
    if (errors?.error) return Response.json({ success: false, message: errors.error.message }, { status: 500 });

    const isInc = (t: any) => (t.type || '').toUpperCase() === 'INCOME';
    const isExp = (t: any) => (t.type || '').toUpperCase() === 'EXPENSE';
    const transactions = txRes.data || [];
    const totalRevenue = transactions.filter(isInc).reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = transactions.filter(isExp).reduce((s, t) => s + Number(t.amount), 0);
    const totalPatrimony = (investmentsRes.data || []).reduce((s, t) => s + Number(t.quantity) * Number(t.current_price), 0);
    const savingsRate = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    const stats = [
      { title: 'Patrimônio Total', value: totalPatrimony, change: 5.2, color: 'text-success' },
      { title: 'Receitas do Mês', value: totalRevenue, change: 8.1, color: 'text-info' },
      { title: 'Despesas do Mês', value: totalExpenses, change: -3.2, color: 'text-destructive' },
      { title: 'Taxa de Poupança', value: savingsRate, change: 1.5, color: 'text-primary', suffix: '%' },
    ];

    const goals = (goalsRes.data || []).map((g, i) => ({
      id: String(i),
      name: g.name || '',
      target: Number(g.target_amount),
      current: Number(g.current_amount),
      progress: Number(g.target_amount) > 0 ? Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100) : 0}));

    const insights = [
      ...(totalExpenses > totalRevenue ? [{ id: '1', title: 'Despesas acima das receitas', description: 'Suas despesas do período excedem suas receitas. Reveja seu orçamento.', priority: 'HIGH' }] : []),
      ...(savingsRate < 10 ? [{ id: '2', title: 'Taxa de poupança baixa', description: 'Sua taxa de poupança está abaixo de 10%. Tente reduzir despesas.', priority: 'MEDIUM' }] : []),
    ];

    return Response.json({ success: true, data: { stats, transactions, goals, insights } });
  });
}
