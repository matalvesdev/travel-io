import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    if (!tripId) {
      return Response.json({ success: false, message: 'tripId é obrigatório' }, { status: 400 });
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) {
      return Response.json({ success: false, message: 'Viagem não encontrada' }, { status: 404 });
    }

    const hotels = await prisma.tripHotel.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json({ success: true, data: hotels });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { tripId, name, address, price, currency, rating, checkIn, checkOut, guests, amenities } = body;

    if (!tripId || !name) {
      return Response.json({ success: false, message: 'Campos obrigatórios: tripId, name' }, { status: 400 });
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) {
      return Response.json({ success: false, message: 'Viagem não encontrada' }, { status: 404 });
    }

    const hotel = await prisma.tripHotel.create({
      data: {
        tripId,
        name,
        address: address || null,
        price: Number(price) || 0,
        currency: currency || 'BRL',
        rating: rating ? Number(rating) : null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: guests ?? 1,
        amenities: amenities || undefined,
      },
    });

    return Response.json({ success: true, data: hotel });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const hotel = await prisma.tripHotel.findFirst({
      where: { id },
      include: { trip: { select: { userId: true } } },
    });

    if (!hotel || hotel.trip.userId !== userId) {
      return Response.json({ success: false, message: 'Hotel não encontrado' }, { status: 404 });
    }

    await prisma.tripHotel.delete({ where: { id } });
    return Response.json({ success: true, message: 'Hotel removido' });
  });
}
