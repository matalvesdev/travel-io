import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase }) => {
    const { data, error } = await supabase
      .from('miles_promotions')
      .select('*')
      .gt('valid_until', new Date().toISOString())
      .order('bonus_percentage', { ascending: false });

    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    const promotions = (data || []).map((p) => ({
      id: p.id,
      program: p.program,
      title: p.title,
      description: p.description,
      bonusPercentage: p.bonus_percentage,
      validUntil: p.valid_until,
      link: p.link,
    }));

    return Response.json({ success: true, data: promotions });
  });
}
