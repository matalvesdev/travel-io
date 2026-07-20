import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({
      success: true,
      data: {
        entries: (data || []).map(e => ({
          id: e.id, loginAt: e.created_at, userAgent: e.details?.userAgent || 'Desconhecido',
          ipAddress: e.ip_address, status: e.action === 'login_success' ? 'SUCCESS' : 'FAILED',
          location: e.details?.location || 'Localização desconhecida'})),
        total: (data || []).length,
      }});
  });
}
