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

    const flights = await prisma.tripFlight.findMany({
      where: { tripId },
      orderBy: { departure: 'asc' },
    });

    return Response.json({ success: true, data: flights });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { tripId, airline, flightNumber, origin, destination, departure, arrival, price, currency, duration, stops } = body;

    if (!tripId || !airline || !origin || !destination || !departure || !arrival) {
      return Response.json({ success: false, message: 'Campos obrigatórios: tripId, airline, origin, destination, departure, arrival' }, { status: 400 });
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) {
      return Response.json({ success: false, message: 'Viagem não encontrada' }, { status: 404 });
    }

    const flight = await prisma.tripFlight.create({
      data: {
        tripId,
        airline,
        flightNumber: flightNumber || null,
        origin,
        destination,
        departure: new Date(departure),
        arrival: new Date(arrival),
        price: Number(price) || 0,
        currency: currency || 'BRL',
        duration: duration || null,
        stops: stops ?? 0,
      },
    });

    return Response.json({ success: true, data: flight });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const flight = await prisma.tripFlight.findFirst({
      where: { id },
      include: { trip: { select: { userId: true } } },
    });

    if (!flight || flight.trip.userId !== userId) {
      return Response.json({ success: false, message: 'Voo não encontrado' }, { status: 404 });
    }

    await prisma.tripFlight.delete({ where: { id } });
    return Response.json({ success: true, message: 'Voo removido' });
  });
}
