import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { searchFlights } from '@/lib/api/skyscanner';

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const body = await request.json();
      const { origin, destination, date, adults } = body;

      if (!origin || !destination || !date) {
        return Response.json(
          { success: false, message: 'origin, destination, and date are required' },
          { status: 400 }
        );
      }

      const flights = await searchFlights(origin, destination, date, adults || 1);

      return Response.json({
        success: true,
        data: { flights },
      });
    } catch (error) {
      console.error('Flight search error:', error);
      return Response.json(
        { success: false, message: 'Failed to search flights' },
        { status: 500 }
      );
    }
  });
}
