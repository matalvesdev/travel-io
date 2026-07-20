import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authenticatedHandler(request, async ({ supabase}) => {
    const { id } = await params;
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { messages: data || [] } });
  });
}
