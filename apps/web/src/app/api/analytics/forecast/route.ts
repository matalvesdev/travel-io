import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, transaction_date')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(100);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });

    const monthlyAvg = (data || []).filter(t => (t.type || '').toUpperCase() === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0) / Math.max(1, 3);
    const forecast = Array.from({ length: 6 }, (_, i) => ({
      period: new Date(Date.now() + i * 30 * 86400000).toISOString().slice(0, 7),
      value: monthlyAvg * (1 + i * 0.02),
      confidence: Math.max(0.5, 0.9 - i * 0.07)}));

    return Response.json({ success: true, data: { forecast } });
  });
}
