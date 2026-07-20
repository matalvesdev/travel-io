import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  const queries: Record<string, string> = {
    day: 'economia finanças mercado ações hoje',
    week: 'economia finanças mercado bolsa semana',
    month: 'economia brasil finanças investimentos',
    year: 'economia brasil mercado financeiro',
  };

  const q = encodeURIComponent(queries[period] || queries.day);
  const rssUrl = `https://news.google.com/rss/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TravelIO/1.0)' },
      next: { revalidate: 600 }});

    if (!res.ok) {
      return NextResponse.json({ news: [], error: `RSS fetch failed: ${res.status}` });
    }

    const text = await res.text();
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    const news = items.slice(0, 10).map(item => {
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

    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json({ news: [], error: String(error) });
  }
}
