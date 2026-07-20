import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...body, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return Response.json({ success: false, message: 'Nenhum arquivo enviado' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) return Response.json({ success: false, message: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() });

    return Response.json({ success: true, data: { avatarUrl: publicUrl } });
  });
}
