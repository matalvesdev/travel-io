import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false });

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({
      success: true,
      data: {
        sessions: (data || []).map(s => ({
          id: s.id, deviceType: s.device_type, userAgent: s.user_agent,
          ipAddress: s.ip_address, lastActiveAt: s.last_active_at,
          expiresAt: s.expires_at, active: s.active, current: false})),
        totalActive: (data || []).filter(s => s.active).length,
      }});
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID da sessão é obrigatório' }, { status: 400 });

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Sessão encerrada com sucesso' });
  });
}
