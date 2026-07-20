import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase }) => {
    const { data, error } = await supabase.from('plans').select('id').limit(1);
    return Response.json({
      success: true,
      data: {
        status: error ? 'degraded' : 'healthy',
        uptime: process.uptime(),
        version: '1.0.0',
      }});
  });
}
