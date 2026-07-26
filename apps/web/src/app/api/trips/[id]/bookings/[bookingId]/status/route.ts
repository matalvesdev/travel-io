import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

// PATCH /api/trips/[id]/bookings/[bookingId]/status - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const { id: tripId, bookingId } = await params;
      const body = await request.json();

      if (!body.status || !VALID_STATUSES.includes(body.status)) {
        return Response.json(
          { success: false, message: 'Status inválido' },
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

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: body.status },
      });

      return Response.json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      return Response.json(
        { success: false, message: 'Erro ao atualizar status' },
        { status: 500 }
      );
    }
  });
}
