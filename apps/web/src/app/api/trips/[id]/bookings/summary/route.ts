import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

// GET /api/trips/[id]/bookings/summary - Get financial summary for bookings
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

      // Get all bookings for this trip
      const bookings = await prisma.booking.findMany({
        where: { tripId },
      });

      // Calculate summary
      const totalSpent = bookings.reduce((sum, booking) => {
        const price = booking.price ? Number(booking.price) : 0;
        return sum + price;
      }, 0);

      const flightCount = bookings.filter(b => b.type === 'flight').length;
      const hotelCount = bookings.filter(b => b.type === 'hotel').length;
      const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

      const budget = trip.budget ? Number(trip.budget) : null;
      const remaining = budget ? budget - totalSpent : null;
      const isOverBudget = budget ? totalSpent > budget : false;

      return Response.json({
        success: true,
        summary: {
          totalSpent,
          flightCount,
          hotelCount,
          confirmedCount,
          cancelledCount,
          budget,
          remaining,
          isOverBudget,
        },
      });
    } catch (error) {
      console.error('Error fetching booking summary:', error);
      return Response.json(
        { success: false, message: 'Erro ao buscar resumo' },
        { status: 500 }
      );
    }
  });
}
