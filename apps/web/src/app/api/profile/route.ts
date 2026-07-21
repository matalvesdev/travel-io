import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.profile.findUnique({ where: { id: userId } });

    if (!data) return Response.json({ success: false, message: 'Perfil não encontrado' }, { status: 404 });
    return Response.json({ success: true, data });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();

    const data = await prisma.profile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: body.name ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        birthDate: body.birth_date ? new Date(body.birth_date) : null,
        avatarUrl: body.avatar_url ?? null,
      },
      update: {
        name: body.name ?? undefined,
        email: body.email ?? undefined,
        phone: body.phone ?? undefined,
        birthDate: body.birth_date ? new Date(body.birth_date) : undefined,
        avatarUrl: body.avatar_url ?? undefined,
        updatedAt: new Date(),
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return Response.json({ success: false, message: 'Nenhum arquivo enviado' }, { status: 400 });

    // Note: File upload to Supabase Storage still uses the Supabase client.
    // This is intentional — Prisma handles data, Supabase handles storage.
    const { getSupabaseClient } = await import('@/lib/api/supabase-helpers');
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!authHeader) return Response.json({ success: false, message: 'Não autorizado' }, { status: 401 });

    const supabase = getSupabaseClient(authHeader);
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) return Response.json({ success: false, message: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await prisma.profile.upsert({
      where: { id: userId },
      create: { id: userId, avatarUrl: publicUrl },
      update: { avatarUrl: publicUrl, updatedAt: new Date() },
    });

    return Response.json({ success: true, data: { avatarUrl: publicUrl } });
  });
}
