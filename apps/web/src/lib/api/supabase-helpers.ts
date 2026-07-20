import { NextRequest } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!authHeader) return null;
  return authHeader;
}

export function getSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function getSupabaseAdmin() {
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient(supabaseUrl, secretKey);
}

export interface ApiHandlerOptions {
  request: NextRequest;
  userId: string;
  supabase: SupabaseClient;
}

export async function authenticatedHandler(
  request: NextRequest,
  handler: (opts: ApiHandlerOptions) => Promise<Response>
): Promise<Response> {
  try {
    const token = getAuthUser(request);
    if (!token) {
      return Response.json({ success: false, message: 'Não autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json({ success: false, message: 'Sessão inválida' }, { status: 401 });
    }

    return handler({ request, userId: user.id, supabase });
  } catch {
    return Response.json({ success: false, message: 'Erro interno' }, { status: 500 });
  }
}
