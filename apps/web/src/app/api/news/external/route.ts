import { NextRequest, NextResponse } from 'next/server';

// Cache for 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
let cachedData: { news: any[]; timestamp: number } = { news: [], timestamp: 0 };

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
}

// Finnhub free API for market news
async function fetchFinnhubNews(category: string = 'general'): Promise<NewsItem[]> {
  const API_KEY = process.env.FINNHUB_API_KEY;
  if (!API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=${category}&token=${API_KEY}`,
    { next: { revalidate: 600 } }
  );

  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status}`);
  }

  const data = await res.json();
  
  return data.slice(0, 10).map((item: any) => ({
    title: item.headline || item.title || 'Notícia',
    summary: item.summary?.slice(0, 250) || '',
    source: item.source || 'Finnhub',
    date: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
    url: item.url || '#',
  }));
}

// Fallback: Use Google News RSS (existing implementation)
async function fetchGoogleNewsRss(query: string): Promise<NewsItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TravelIO/1.0)' },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status}`);
  }

  const text = await res.text();
  const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

  return items.slice(0, 10).map(item => {
    const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
    const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
    const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() || '';

    return {
      title: title.replace(/ - [^-]+$/, ''),
      summary: description.slice(0, 250),
      source: source || 'Google Notícias',
      date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      url: link,
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  // Check cache
  if (cachedData.news.length > 0 && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({ news: cachedData.news, cached: true });
  }

  const queries: Record<string, string> = {
    day: 'economia finanças mercado ações hoje',
    week: 'economia finanças mercado bolsa semana',
    month: 'economia brasil finanças investimentos',
    year: 'economia brasil mercado financeiro',
  };

  let news: NewsItem[] = [];

  // Try Finnhub first
  try {
    news = await fetchFinnhubNews('general');
  } catch (finnhubError) {
    console.log('Finnhub failed, falling back to Google News:', finnhubError);
    
    // Fallback to Google News RSS
    try {
      news = await fetchGoogleNewsRss(queries[period] || queries.day);
    } catch (rssError) {
      console.error('Both news sources failed:', rssError);
      // Return empty with error info
      return NextResponse.json({ 
        news: [], 
        error: 'Unable to fetch news',
        fallback: true 
      });
    }
  }

  // Update cache
  cachedData = { news, timestamp: Date.now() };

  return NextResponse.json({ news, cached: false });
}
