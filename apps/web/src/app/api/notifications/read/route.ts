import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true });
  });
}
