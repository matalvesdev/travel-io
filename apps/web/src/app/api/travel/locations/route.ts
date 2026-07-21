import { NextRequest } from 'next/server';
import { searchLocations } from '@/lib/api/skyscanner';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return Response.json({
        success: true,
        data: { locations: [] },
      });
    }

    const locations = await searchLocations(query);

    return Response.json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    console.error('Location search error:', error);
    return Response.json({
      success: true,
      data: { locations: [] },
    });
  }
}
