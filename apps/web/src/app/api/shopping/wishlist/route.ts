import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { items: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.wishlistItem.create({
      data: {
        name: body.name,
        store: body.store ?? null,
        currentPrice: body.current_price ?? null,
        targetPrice: body.target_price ?? null,
        url: body.url ?? null,
        monitorPrice: body.monitor_price ?? false,
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.wishlistItem.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Item não encontrado' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({ where: { id } });
    return Response.json({ success: true, message: 'Item removido' });
  });
}
