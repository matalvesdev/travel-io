import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase }) => {
    const { data, error } = await supabase
      .from('transfer_routes')
      .select('*')
      .eq('is_active', true)
      .order('from_program', { ascending: true });

    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    const routes = (data || []).map((r) => ({
      id: r.id,
      fromProgram: r.from_program,
      toProgram: r.to_program,
      conversionRate: Number(r.conversion_rate),
      minTransfer: Number(r.min_transfer),
      maxTransfer: r.max_transfer ? Number(r.max_transfer) : null,
      isActive: r.is_active,
    }));

    return Response.json({ success: true, data: routes });
  });
}
