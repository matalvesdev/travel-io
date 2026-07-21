import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { alerts: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.priceAlert.create({
      data: {
        name: body.name,
        type: body.type ?? 'flight',
        origin: body.origin ?? null,
        destination: body.destination,
        checkin: body.checkin ? new Date(body.checkin) : null,
        checkout: body.checkout ? new Date(body.checkout) : null,
        store: body.store ?? 'all',
        currentPrice: body.current_price ?? 0,
        targetPrice: body.target_price ?? 0,
        history: body.history ?? [],
        active: body.active ?? true,
        tripId: body.trip_id ?? null,
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Alerta não encontrado' }, { status: 404 });
    }

    const data = await prisma.priceAlert.update({ where: { id }, data: updates });
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
