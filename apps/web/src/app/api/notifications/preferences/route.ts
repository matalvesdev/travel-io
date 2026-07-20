import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data: data || {} });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...body, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}
