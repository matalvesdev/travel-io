import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.priceMonitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { monitors: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.priceMonitor.create({
      data: {
        productName: body.product_name,
        url: body.url ?? null,
        targetPrice: body.target_price ?? null,
        currentPrice: body.current_price ?? null,
        isActive: body.is_active ?? true,
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

    const existing = await prisma.priceMonitor.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Monitor não encontrado' }, { status: 404 });
    }

    await prisma.priceMonitor.delete({ where: { id } });
    return Response.json({ success: true, message: 'Monitor removido' });
  });
}
