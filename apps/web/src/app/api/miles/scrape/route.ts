import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { searchMilesFlights } from '@/lib/scrapers/miles-flights';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const origin = searchParams.get('origin');
      const destination = searchParams.get('destination');
      const date = searchParams.get('date');
      const adults = parseInt(searchParams.get('adults') || '1');

      if (!origin || !destination || !date) {
        return Response.json(
          { success: false, message: 'origin, destination, and date are required' },
          { status: 400 }
        );
      }

      if (origin.length !== 3 || destination.length !== 3) {
        return Response.json(
          { success: false, message: 'origin and destination must be 3-letter IATA codes' },
          { status: 400 }
        );
      }

      const result = await searchMilesFlights(
        origin.toUpperCase(),
        destination.toUpperCase(),
        date,
        adults,
      );

      return Response.json({ success: true, data: result });
    } catch (error) {
      console.error('Miles scrape error:', error);
      return Response.json(
        { success: false, message: 'Failed to scrape miles flights' },
        { status: 500 }
      );
    }
  });
}
