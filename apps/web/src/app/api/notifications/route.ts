import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'ALL';

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'UNREAD') query = query.eq('read', false);
    else if (filter === 'READ') query = query.eq('read', true);

    const { data, error } = await query;

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });

    const notifications = (data || []).map((n: any) => ({
      id: n.id,
      type: n.type || 'info',
      title: n.title,
      body: n.body,
      read: n.read || false,
      createdAt: n.created_at}));

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return Response.json({ success: true, data: { notifications, unreadCount } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...body, user_id: userId, read: false })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}
