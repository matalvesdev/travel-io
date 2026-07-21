import { NextRequest, NextResponse } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { fetchBrApiQuotes, type BrApiStockData } from '@/lib/api/brapi';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ supabase }) => {
    try {
      const { searchParams } = new URL(request.url);
      const symbols = searchParams.get('symbols') || '';

      if (!symbols) {
        return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
      }

      const results = await fetchBrApiQuotes(symbols);

      if (results.length === 0) {
        return NextResponse.json({ results: [], error: 'No data found or BRAPI_TOKEN not configured' });
      }

      return NextResponse.json({ results });
    } catch (err) {
      console.error('[brapi] Error:', err);
      return NextResponse.json({ results: [], error: 'Failed to fetch stock data' }, { status: 502 });
    }
  });
}
