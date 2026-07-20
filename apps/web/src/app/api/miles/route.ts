import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const program = searchParams.get('program');

    let query = supabase
      .from('miles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (program) query = query.eq('program', program);

    const [milesResult, transactionsResult] = await Promise.all([
      query,
      supabase
        .from('miles_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50),
    ]);

    if (milesResult.error) return Response.json({ success: false, message: milesResult.error.message }, { status: 500 });

    return Response.json({
      success: true,
      data: {
        programs: milesResult.data,
        transactions: transactionsResult.data || [],
      }});
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('miles')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const { data, error } = await supabase
      .from('miles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}
