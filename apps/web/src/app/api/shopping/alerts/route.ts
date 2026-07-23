import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.priceAlert.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return Response.json({ success: true, data: { alerts: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    
    const data = await prisma.priceAlert.create({
      data: {
        name: body.name ?? null,
        type: body.type || 'price_drop',
        origin: body.origin ?? null,
        destination: body.destination ?? null,
        checkin: body.checkin ? new Date(body.checkin) : null,
        checkout: body.checkout ? new Date(body.checkout) : null,
        store: body.store ?? null,
        currentPrice: body.current_price ?? null,
        targetPrice: body.target_price,
        active: true,
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });
    }

    const existing = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Alerta não encontrado' }, { status: 404 });
    }

    const prismaData: any = {};
    if (updateData.active !== undefined) prismaData.active = updateData.active;
    if (updateData.current_price !== undefined) prismaData.currentPrice = updateData.current_price;
    if (updateData.target_price !== undefined) prismaData.targetPrice = updateData.target_price;

    const data = await prisma.priceAlert.update({
      where: { id },
      data: prismaData,
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Alerta não encontrado' }, { status: 404 });
    }

    await prisma.priceAlert.delete({ where: { id } });
    return Response.json({ success: true, message: 'Alerta removido' });
  });
}
