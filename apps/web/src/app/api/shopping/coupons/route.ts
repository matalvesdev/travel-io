import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase}) => {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = supabase.from('coupons').select('*').order('end_date', { ascending: true });
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { coupons: data || [] } });
  });
}
