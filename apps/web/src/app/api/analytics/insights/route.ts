import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: '#f87171', Transporte: '#fb923c', Moradia: '#fbbf24', Saúde: '#a3e635',
  Educação: '#34d399', Lazer: '#2dd4bf', Compras: '#60a5fa', Assinaturas: '#818cf8',
  Serviços: '#a78bfa', Viagem: '#c084fc', Outros: '#e2e8f0',
};

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, category_name, amount, transaction_date')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(500);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });

    const tx = data || [];

    const isIncome = (t: any) => (t.type || '').toUpperCase() === 'INCOME';
    const isExpense = (t: any) => (t.type || '').toUpperCase() === 'EXPENSE';

    const totalIncome = tx.filter(isIncome).reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = tx.filter(isExpense).reduce((s, t) => s + Number(t.amount), 0);

    const getCat = (t: any) => t.category_name || t.category || 'Outros';

    const topCategory = Object.entries(
      tx.filter(isExpense).reduce<Record<string, number>>((acc, t) => {
        const cat = getCat(t);
        acc[cat] = (acc[cat] || 0) + Number(t.amount);
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const insights: Array<{ id: string; type: string; title: string; description: string; priority: string; createdAt: string }> = [];
    if (totalExpense > totalIncome) {
      insights.push({ id: '1', type: 'warning', title: 'Gastos acima da receita', description: 'Suas despesas estão superando a receita. Reveja seu orçamento.', priority: 'HIGH', createdAt: new Date().toISOString() });
    }
    if (topCategory) {
      insights.push({ id: '2', type: 'info', title: 'Maior categoria de gasto', description: `${topCategory[0]}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topCategory[1])}`, priority: 'MEDIUM', createdAt: new Date().toISOString() });
    }
    insights.push({ id: '3', type: 'tip', title: `Receita total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}`, description: `Saldo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome - totalExpense)}`, priority: 'LOW', createdAt: new Date().toISOString() });

    // Monthly data for bar chart
    const monthlyMap = tx.reduce<Record<string, { income: number; expenses: number }>>((acc, t) => {
      const dateStr = (t as any).transaction_date || (t as any).date;
      const month = dateStr?.slice(0, 7) || 'desconhecido';
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      if (isIncome(t)) acc[month].income += Number(t.amount);
      else acc[month].expenses += Number(t.amount);
      return acc;
    }, {});
    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, income: vals.income, expenses: vals.expenses }));

    // Category breakdown for pie
    const catMap = tx.filter(isExpense).reduce<Record<string, number>>((acc, t) => {
      const cat = getCat(t);
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});
    const catTotal = Object.values(catMap).reduce((s, v) => s + v, 0);
    const categoryBreakdown = Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value: catTotal > 0 ? Math.round((value / catTotal) * 100) : 0,
        color: CATEGORY_COLORS[name] || '#e2e8f0'}));

    return Response.json({ success: true, data: { insights, monthlyData, categoryBreakdown } });
  });
}
