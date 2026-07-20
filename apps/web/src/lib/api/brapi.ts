// BrAPI v2 Integration — Brazilian Stock Market API
// Docs: https://brapi.dev/docs

export interface BrApiStockData {
  stock: string;
  name: string;
  close: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  logoUrl: string;
  shortName: string;
  currency: string;
}

/**
 * Fetch stock quotes from BrAPI v2
 * @param symbols - Comma-separated stock symbols (e.g., "PETR4,VALE3,ITUB4")
 * @returns Array of stock data or empty array on error
 */
export async function fetchBrApiQuotes(symbols: string): Promise<BrApiStockData[]> {
  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    console.warn('BRAPI_TOKEN not configured');
    return [];
  }

  const url = `https://brapi.dev/api/v2/stocks/quote?symbols=${encodeURIComponent(symbols)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`BrAPI error: HTTP ${response.status}`);
      return [];
    }

    const raw = await response.json();
    // BrAPI v2 returns nested data: results[i].data.{regularMarketPrice, ...}
    return (raw.results || []).map((r: any) => ({
      stock: r.symbol || r.requestedSymbol || '',
      name: r.data?.longName || r.data?.shortName || r.symbol || '',
      close: r.data?.regularMarketPrice || 0,
      change: r.data?.regularMarketChange || 0,
      changePercent: r.data?.regularMarketChangePercent || 0,
      open: r.data?.regularMarketOpen || 0,
      high: r.data?.regularMarketDayHigh || 0,
      low: r.data?.regularMarketDayLow || 0,
      volume: r.data?.regularMarketVolume || 0,
      marketCap: r.data?.marketCap || 0,
      logoUrl: r.data?.logourl || '',
      shortName: r.data?.shortName || r.symbol || '',
      currency: r.data?.currency || 'BRL',
    }));
  } catch (error) {
    console.error('BrAPI fetch error:', error);
    return [];
  }
}

export async function fetchBrApiQuote(symbol: string): Promise<BrApiStockData | null> {
  const results = await fetchBrApiQuotes(symbol);
  return results.length > 0 ? results[0] : null;
}
