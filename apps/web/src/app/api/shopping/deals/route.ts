import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase}) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') query = query.eq('category', category);
    if (search) query = query.or(`product_name.ilike.%${search}%,store_name.ilike.%${search}%,category.ilike.%${search}%`);

    const { data, error } = await query;

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { deals: data || [] } });
  });
}
