import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase }) => {
    const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { plans: data || [] } });
  });
}
