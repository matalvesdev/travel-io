import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { investments: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('investments')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Investimento excluído' });
  });
}
