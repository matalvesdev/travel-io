import { NextResponse } from 'next/server';

const API_BASE = 'https://app.apidevoos.dev/api';
const API_KEY = process.env.APIDEVOOS_KEY || '';

const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Flight Search ───
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, adults, children, cabinClass, searchType } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'origin, destination, departureDate required' }, { status: 400 });
    }

    const slices: any[] = [
      { origin, destination, departureDate },
    ];
    if (returnDate) {
      slices.push({ origin: destination, destination: origin, departureDate: returnDate });
    }

    const passengers: any[] = [{ type: 'adult', count: adults || 1 }];
    if (children && children > 0) passengers.push({ type: 'child', count: children });

    const reqBody: any = {
      type: returnDate ? 'round_trip' : 'one_way',
      slices,
      passengers,
      cabinClass: cabinClass || 'economy',
      enableDeduplication: true,
    };
    if (searchType) reqBody.searchType = searchType;

    const res = await fetch(`${API_BASE}/v1/flights/search`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(30000)});

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error: `API error ${res.status}`, details: error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}

// ─── Airport Autocomplete ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const res = await fetch(`${API_BASE}/flights/consulta-aereo/aeroportos?filtro=${encodeURIComponent(query)}`, {
      method: 'POST',
      headers: HEADERS,
      signal: AbortSignal.timeout(10000)});

    const data = await res.json();
    const airports = data.Success ? (data.Data || []) : [];

    return NextResponse.json({ results: airports });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
