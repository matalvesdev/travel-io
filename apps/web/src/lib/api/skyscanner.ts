// Skyscanner API Client — v3
// Docs: https://developers.skyscanner.net
// Get a key: https://www.partners.skyscanner.net/contact/general

const SKYSCANNER_BASE = 'https://partners.api.skyscanner.net/apiservices/v3';
const SKYSCANNER_KEY = process.env.SKYSCANNER_API_KEY;

function getHeaders(): Record<string, string> {
  return {
    'x-api-key': SKYSCANNER_KEY || '',
    'Content-Type': 'application/json',
  };
}

// ─── Flight Search ───
export interface FlightResult {
  id: string;
  airline: string;
  airlineLogo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  deepLink: string;
}

export async function searchFlights(
  origin: string,
  destination: string,
  date: string,
  adults: number = 1
): Promise<FlightResult[]> {
  if (!SKYSCANNER_KEY) {
    console.warn('SKYSCANNER_API_KEY not configured');
    return [];
  }

  try {
    const [year, month, day] = date.split('-').map(Number);

    const res = await fetch(`${SKYSCANNER_BASE}/flights/live/search/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        query: {
          market: 'BR',
          locale: 'pt-BR',
          currency: 'BRL',
          queryLegs: [
            {
              originPlaceId: { iata: origin },
              destinationPlaceId: { iata: destination },
              date: { year, month, day },
            },
          ],
          adults,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`Skyscanner flight search error: HTTP ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const content = raw?.content || raw?.data?.content || {};
    const itineraries = content?.results?.itineraries || {};
    const legs = content?.results?.legs || {};
    const places = content?.results?.places || {};

    const flights: FlightResult[] = [];
    for (const [id, itinerary] of Object.entries<any>(itineraries)) {
      const legId = itinerary.legIds?.[0];
      const leg = legs[legId];
      if (!leg) continue;

      const originPlace = places[leg.originPlaceId];
      const destPlace = places[leg.destinationPlaceId];
      const pricingOption = itinerary.pricingOptions?.[0];
      const price = pricingOption?.price;

      flights.push({
        id,
        airline: leg.marketingCarrierIds?.[0] || '',
        airlineLogo: '',
        origin: originPlace?.iata || origin,
        destination: destPlace?.iata || destination,
        departureTime: leg.departureDateTime
          ? `${String(leg.departureDateTime.hour).padStart(2, '0')}:${String(leg.departureDateTime.minute).padStart(2, '0')}`
          : '',
        arrivalTime: leg.arrivalDateTime
          ? `${String(leg.arrivalDateTime.hour).padStart(2, '0')}:${String(leg.arrivalDateTime.minute).padStart(2, '0')}`
          : '',
        duration: leg.durationInMinutes
          ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}min`
          : '',
        stops: leg.stopCount || 0,
        price: price?.amount ? parseFloat(price.amount) : 0,
        currency: price?.unit || 'BRL',
        deepLink: pricingOption?.items?.[0]?.deepLink || '',
      });
    }

    return flights;
  } catch (error) {
    console.error('Skyscanner flight search error:', error);
    return [];
  }
}

// ─── Hotel Search ───
export interface HotelResult {
  id: string;
  name: string;
  starRating: number;
  address: string;
  city: string;
  price: number;
  currency: string;
  checkin: string;
  checkout: string;
  imageUrl: string;
  deepLink: string;
}

export async function searchHotels(
  destination: string,
  checkin: string,
  checkout: string,
  adults: number = 1
): Promise<HotelResult[]> {
  if (!SKYSCANNER_KEY) {
    console.warn('SKYSCANNER_API_KEY not configured');
    return [];
  }

  try {
    const res = await fetch(`${SKYSCANNER_BASE}/hotels/live/search/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        query: {
          market: 'BR',
          locale: 'pt-BR',
          currency: 'BRL',
          entityId: destination,
          checkIn: checkin,
          checkOut: checkout,
          adults,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`Skyscanner hotel search error: HTTP ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const content = raw?.content || raw?.data?.content || {};
    const hotelsData = content?.results?.hotels || [];

    return hotelsData.map((hotel: any) => ({
      id: hotel.id || '',
      name: hotel.name || '',
      starRating: hotel.starRating || 0,
      address: hotel.address || '',
      city: hotel.city || '',
      price: hotel.price?.amount ? parseFloat(hotel.price.amount) : 0,
      currency: hotel.price?.unit || 'BRL',
      checkin,
      checkout,
      imageUrl: hotel.imageUrl || '',
      deepLink: hotel.deepLink || '',
    }));
  } catch (error) {
    console.error('Skyscanner hotel search error:', error);
    return [];
  }
}

// ─── Location Autocomplete ───
export interface LocationSuggestion {
  id: string;
  name: string;
  type: string;
  iata: string;
  city: string;
  country: string;
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!SKYSCANNER_KEY) {
    console.warn('SKYSCANNER_API_KEY not configured');
    return [];
  }

  if (!query || query.length < 2) return [];

  try {
    const res = await fetch(`${SKYSCANNER_BASE}/autosuggest/flights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        query: {
          market: 'BR',
          locale: 'pt-BR',
          searchTerm: query,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`Skyscanner location search error: HTTP ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const places = raw?.places || [];

    return places.map((place: any) => ({
      id: place.entityId || '',
      name: place.name || '',
      type: place.type || '',
      iata: place.iataCode || '',
      city: place.cityName || '',
      country: place.countryName || '',
    }));
  } catch (error) {
    console.error('Skyscanner location search error:', error);
    return [];
  }
}
