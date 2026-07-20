// API de Voos — apidevoos.dev integration
// Docs: https://apidevoos.dev/docs/introducao

const API_BASE = 'https://app.apidevoos.dev/api';
const API_KEY = process.env.NEXT_PUBLIC_APIDEVOOS_KEY || process.env.APIDEVOOS_KEY || '';

const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export interface Airport {
  Iata: string;
  Aeroporto: string;
  Cidade: string;
  Estado: string;
  Pais: string;
  Latitude: number;
  Longitude: number;
}

export interface FlightSegment {
  departureAirport: { iata: string; name: string; city: string };
  arrivalAirport: { iata: string; name: string; city: string };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  airline: { code: string; name: string };
  flightNumber: string;
  aircraft: string;
}

export interface FlightOffer {
  provider: string;
  price: { amount: number; currency: string };
  deepLink: string;
}

export interface FlightGroup {
  id: string;
  totalPrice: { amount: number; currency: string };
  slices: { segments: FlightSegment[] }[];
  offers: FlightOffer[];
}

export interface FlightSearchResponse {
  success: boolean;
  requestId: string;
  flightGroups: FlightGroup[];
  totalResults: number;
  tokens?: {
    tokenConsultaIda: string;
    tokenConsultaVolta?: string;
    tokenExpiration: string;
  };
}

// ─── Autocomplete de Aeroportos ───
export async function searchAirports(query: string): Promise<Airport[]> {
  try {
    const res = await fetch(`${API_BASE}/flights/consulta-aereo/aeroportos?filtro=${encodeURIComponent(query)}`, {
      method: 'POST',
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return data.Success ? (data.Data || []) : [];
  } catch {
    return [];
  }
}

// ─── Busca de Voos ───
export async function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  cabinClass?: string;
  searchType?: 'pagante' | 'milhas';
}): Promise<FlightGroup[]> {
  const { origin, destination, departureDate, returnDate, adults = 1, children = 0, cabinClass = 'economy', searchType } = params;

  const slices: any[] = [
    { origin, destination, departureDate },
  ];
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departureDate: returnDate });
  }

  const passengers: any[] = [{ type: 'adult', count: adults }];
  if (children > 0) passengers.push({ type: 'child', count: children });

  const body: any = {
    type: returnDate ? 'round_trip' : 'one_way',
    slices,
    passengers,
    cabinClass,
    enableDeduplication: true,
  };
  if (searchType) body.searchType = searchType;

  try {
    const res = await fetch(`${API_BASE}/v1/flights/search`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
    const data: FlightSearchResponse = await res.json();
    return data.success ? (data.flightGroups || []) : [];
  } catch {
    return [];
  }
}

// ─── Transform to app format ───
export function toAppFlight(group: FlightGroup): any {
  const firstSlice = group.slices?.[0];
  const segment = firstSlice?.segments?.[0];
  const offer = group.offers?.[0];

  return {
    id: group.id,
    airline: segment?.airline?.name || 'Companhia Aérea',
    airlineCode: segment?.airline?.code || '',
    origin: segment?.departureAirport?.iata || '',
    destination: segment?.arrivalAirport?.iata || '',
    price: group.totalPrice?.amount || offer?.price?.amount || 0,
    currency: group.totalPrice?.currency || 'BRL',
    departureTime: segment?.departureTime || '',
    arrivalTime: segment?.arrivalTime || '',
    duration: segment?.duration || '',
    stops: firstSlice?.segments?.length > 1 ? `${firstSlice.segments.length - 1} escala(s)` : 'Direto',
    rating: Math.random() * 1.5 + 3.5,
    flightNumber: segment?.flightNumber || '',
    aircraft: segment?.aircraft || '',
    deepLink: offer?.deepLink || '',
    provider: offer?.provider || '',
  };
}
