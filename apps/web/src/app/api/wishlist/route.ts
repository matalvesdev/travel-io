import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;

    const items = await prisma.travelWishlistItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return Response.json({ success: true, data: { items } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { type, name } = body;

    if (!type || !name) {
      return Response.json(
        { success: false, message: 'Campos obrigatórios: type, name' },
        { status: 400 }
      );
    }

    if (!['flight', 'hotel', 'destination'].includes(type)) {
      return Response.json(
        { success: false, message: 'Tipo inválido. Use: flight, hotel ou destination' },
        { status: 400 }
      );
    }

    const item = await prisma.travelWishlistItem.create({
      data: {
        userId,
        type,
        name,
        notes: body.notes,
        targetPrice: body.targetPrice,
        currency: body.currency || 'BRL',
        origin: body.origin,
        destination: body.destination,
        airline: body.airline,
        flightNumber: body.flightNumber,
        departureDate: body.departureDate ? new Date(body.departureDate) : undefined,
        hotelName: body.hotelName,
        hotelAddress: body.hotelAddress,
        checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
        checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
        nights: body.nights,
        roomType: body.roomType,
        country: body.country,
        imageUrl: body.imageUrl,
      },
    });

    return Response.json({ success: true, data: item }, { status: 201 });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json(
        { success: false, message: 'ID não informado' },
        { status: 400 }
      );
    }

    const existing = await prisma.travelWishlistItem.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json(
        { success: false, message: 'Item não encontrado' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.targetPrice !== undefined) data.targetPrice = body.targetPrice;
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.origin !== undefined) data.origin = body.origin;
    if (body.destination !== undefined) data.destination = body.destination;
    if (body.airline !== undefined) data.airline = body.airline;
    if (body.flightNumber !== undefined) data.flightNumber = body.flightNumber;
    if (body.departureDate !== undefined) data.departureDate = new Date(body.departureDate);
    if (body.hotelName !== undefined) data.hotelName = body.hotelName;
    if (body.hotelAddress !== undefined) data.hotelAddress = body.hotelAddress;
    if (body.checkIn !== undefined) data.checkIn = new Date(body.checkIn);
    if (body.checkOut !== undefined) data.checkOut = new Date(body.checkOut);
    if (body.nights !== undefined) data.nights = body.nights;
    if (body.roomType !== undefined) data.roomType = body.roomType;
    if (body.country !== undefined) data.country = body.country;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

    const updated = await prisma.travelWishlistItem.update({ where: { id }, data });

    return Response.json({ success: true, data: updated });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { success: false, message: 'ID não informado' },
        { status: 400 }
      );
    }

    const existing = await prisma.travelWishlistItem.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json(
        { success: false, message: 'Item não encontrado' },
        { status: 404 }
      );
    }

    await prisma.travelWishlistItem.delete({ where: { id } });

    return Response.json({ success: true, message: 'Item removido da wishlist' });
  });
}
