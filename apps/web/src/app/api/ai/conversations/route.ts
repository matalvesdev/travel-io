import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { conversations: data || [] } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, title: 'Nova conversa' })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { conversationId: data.id } });
  });
}
