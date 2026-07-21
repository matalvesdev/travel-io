import { NextRequest, NextResponse } from 'next/server';
import { fetchBrApiNews } from '@/lib/api/brapi';

// Cache for 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
let cachedData: { news: any[]; timestamp: number } = { news: [], timestamp: 0 };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols') || undefined;

  // Check cache
  if (cachedData.news.length > 0 && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({ news: cachedData.news, cached: true });
  }

  try {
    const news = await fetchBrApiNews(symbols);

    // Update cache
    cachedData = { news, timestamp: Date.now() };

    return NextResponse.json({ news, cached: false });
  } catch (error) {
    return NextResponse.json({ news: [], error: String(error) });
  }
}
