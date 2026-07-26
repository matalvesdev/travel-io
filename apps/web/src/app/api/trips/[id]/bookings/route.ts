import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

// GET /api/trips/[id]/bookings - List all bookings for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const { id: tripId } = await params;

      // Verify trip belongs to user
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
      });

      if (!trip) {
        return Response.json(
          { success: false, message: 'Viagem não encontrada' },
          { status: 404 }
        );
      }

      const bookings = await prisma.booking.findMany({
        where: { tripId },
        orderBy: { createdAt: 'desc' },
      });

      return Response.json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return Response.json(
        { success: false, message: 'Erro ao buscar reservas' },
        { status: 500 }
      );
    }
  });
}

// POST /api/trips/[id]/bookings - Create a new booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const { id: tripId } = await params;
      const body = await request.json();

      // Verify trip belongs to user
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
      });

      if (!trip) {
        return Response.json(
          { success: false, message: 'Viagem não encontrada' },
          { status: 404 }
        );
      }

      // Validate required fields
      if (!body.type || !['flight', 'hotel'].includes(body.type)) {
        return Response.json(
          { success: false, message: 'Tipo de reserva inválido' },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.create({
        data: {
          tripId,
          userId,
          type: body.type,
          status: body.status || 'confirmed',
          confirmationCode: body.confirmationCode,
          notes: body.notes,
          airline: body.airline,
          flightNumber: body.flightNumber,
          origin: body.origin,
          destination: body.destination,
          departureDate: body.departureDate ? new Date(body.departureDate) : null,
          arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
          departureTime: body.departureTime,
          arrivalTime: body.arrivalTime,
          hotelName: body.hotelName,
          hotelAddress: body.hotelAddress,
          checkIn: body.checkIn ? new Date(body.checkIn) : null,
          checkOut: body.checkOut ? new Date(body.checkOut) : null,
          nights: body.nights,
          roomType: body.roomType,
          price: body.price,
          currency: body.currency || 'BRL',
        },
      });

      return Response.json({
        success: true,
        booking,
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating booking:', error);
      return Response.json(
        { success: false, message: 'Erro ao criar reserva' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/trips/[id]/bookings - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const { id: tripId } = await params;
      const body = await request.json();

      if (!body.id) {
        return Response.json(
          { success: false, message: 'ID da reserva é obrigatório' },
          { status: 400 }
        );
      }

      // Verify booking exists and belongs to user's trip
      const existingBooking = await prisma.booking.findFirst({
        where: {
          id: body.id,
          tripId,
          userId,
        },
      });

      if (!existingBooking) {
        return Response.json(
          { success: false, message: 'Reserva não encontrada' },
          { status: 404 }
        );
      }

      const booking = await prisma.booking.update({
        where: { id: body.id },
        data: {
          type: body.type,
          status: body.status,
          confirmationCode: body.confirmationCode,
          notes: body.notes,
          airline: body.airline,
          flightNumber: body.flightNumber,
          origin: body.origin,
          destination: body.destination,
          departureDate: body.departureDate ? new Date(body.departureDate) : undefined,
          arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : undefined,
          departureTime: body.departureTime,
          arrivalTime: body.arrivalTime,
          hotelName: body.hotelName,
          hotelAddress: body.hotelAddress,
          checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
          checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
          nights: body.nights,
          roomType: body.roomType,
          price: body.price,
          currency: body.currency,
        },
      });

      return Response.json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      return Response.json(
        { success: false, message: 'Erro ao atualizar reserva' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/trips/[id]/bookings - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const { id: tripId } = await params;
      const { searchParams } = new URL(request.url);
      const bookingId = searchParams.get('bookingId');

      if (!bookingId) {
        return Response.json(
          { success: false, message: 'ID da reserva é obrigatório' },
          { status: 400 }
        );
      }

      // Verify booking exists and belongs to user's trip
      const existingBooking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          tripId,
          userId,
        },
      });

      if (!existingBooking) {
        return Response.json(
          { success: false, message: 'Reserva não encontrada' },
          { status: 404 }
        );
      }

      await prisma.booking.delete({
        where: { id: bookingId },
      });

      return Response.json({
        success: true,
        message: 'Reserva excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      return Response.json(
        { success: false, message: 'Erro ao excluir reserva' },
        { status: 500 }
      );
    }
  });
}
