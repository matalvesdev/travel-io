import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { searchHotels } from '@/lib/api/skyscanner';

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const body = await request.json();
      const { destination, checkin, checkout, adults } = body;

      if (!destination || !checkin || !checkout) {
        return Response.json(
          { success: false, message: 'destination, checkin, and checkout are required' },
          { status: 400 }
        );
      }

      const hotels = await searchHotels(destination, checkin, checkout, adults || 1);

      return Response.json({
        success: true,
        data: { hotels },
      });
    } catch (error) {
      console.error('Hotel search error:', error);
      return Response.json(
        { success: false, message: 'Failed to search hotels' },
        { status: 500 }
      );
    }
  });
}
