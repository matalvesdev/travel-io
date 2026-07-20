import { NextRequest } from 'next/server';
import { getAuthUser, getSupabaseClient } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || '';
  const totalCost = Number(searchParams.get('totalCost') || 8000);
  const budget = Number(searchParams.get('budget') || 10000);

  const token = getAuthUser(request);
  let userMiles = 30000;
  let averageCost = totalCost;

  if (token) {
    try {
      const supabase = getSupabaseClient(token);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: milesData } = await supabase
          .from('miles')
          .select('balance')
          .eq('user_id', user.id);

        if (milesData && milesData.length > 0) {
          userMiles = milesData.reduce((sum, m) => sum + Number(m.balance), 0);
        }

        const { data: tripData } = await supabase
          .from('trips')
          .select('budget')
          .not('budget', 'is', null)
          .eq('user_id', user.id)
          .limit(5);

        if (tripData && tripData.length > 0) {
          averageCost = tripData.reduce((sum, t) => sum + Number(t.budget), 0) / tripData.length;
        }
      }
    } catch (e) {
      console.warn('[savings-plan] Failed to load user data, using defaults:', e);
    }
  }

  const plans: { title: string; strategy: string; savings: number; timeline: string }[] = [];

  if (userMiles > 0) {
    const milesValue = userMiles * 0.025;
    plans.push({ title: 'Use suas milhas', strategy: `Converta ${userMiles.toLocaleString()} pontos em dinheiro`, savings: milesValue, timeline: 'Imediato' });
  }
  plans.push({ title: 'Compre com antecedência', strategy: 'Voos 45-60 dias antes custam até 30% menos', savings: averageCost * 0.25, timeline: '45-60 dias antes' });
  plans.push({ title: 'PIX com desconto', strategy: 'Pague via PIX para ganhar 5% de desconto', savings: averageCost * 0.05, timeline: 'Na compra' });
  plans.push({ title: 'Baixa temporada', strategy: 'Viaje em meses menos procurados para 20-30% de economia', savings: averageCost * 0.25, timeline: 'Planejar 3-6 meses' });

  return Response.json({
    success: true,
    data: {
      destination,
      estimatedCost: averageCost,
      savingsPlans: plans.sort((a, b) => b.savings - a.savings),
    }});
}
