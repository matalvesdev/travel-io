// Skyscanner API Client via RapidAPI
// Docs: https://rapidapi.com/skyscanner/api/skyscanner

const SKYSCANNER_HOST = 'skyscanner-api.p.rapidapi.com';
const SKYSCANNER_KEY = process.env.SKYSCANNER_API_KEY;

function getHeaders(): Record<string, string> {
  return {
    'X-RapidAPI-Key': SKYSCANNER_KEY || '',
    'X-RapidAPI-Host': SKYSCANNER_HOST,
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
    const res = await fetch(`https://${SKYSCANNER_HOST}/flights/live/search/create`, {
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
              date: { year: parseInt(date.slice(0, 4)), month: parseInt(date.slice(5, 7)), day: parseInt(date.slice(8, 10)) },
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
    const itineraries = raw?.data?.itineraries || {};

    const flights: FlightResult[] = [];
    for (const [id, itinerary] of Object.entries<any>(itineraries)) {
      const leg = itinerary.legs?.[0];
      if (!leg) continue;

      flights.push({
        id,
        airline: leg.operatingCarriers?.[0] || leg.carriers?.marketing?.[0] || '',
        airlineLogo: '',
        origin: leg.origin?.iata || origin,
        destination: leg.destination?.iata || destination,
        departureTime: leg.departure || '',
        arrivalTime: leg.arrival || '',
        duration: leg.durationInMinutes ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}min` : '',
        stops: leg.stops?.length || 0,
        price: itinerary.price?.amount ? parseFloat(itinerary.price.amount) : 0,
        currency: itinerary.price?.unit || 'BRL',
        deepLink: itinerary.deepLink || '',
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
    const res = await fetch(`https://${SKYSCANNER_HOST}/hotels/live/search/create`, {
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
    const hotels = raw?.data?.results?.hotels || [];

    return hotels.map((hotel: any) => ({
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
    const res = await fetch(
      `https://${SKYSCANNER_HOST}/autosuggest-flights/v1.0/BR/BRL/pt-BR/${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      console.error(`Skyscanner location search error: HTTP ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const places = raw?.places || [];

    return places.map((place: any) => ({
      id: place.placeId || '',
      name: place.placeName || '',
      type: place.placeType || '',
      iata: place.iata || '',
      city: place.cityName || '',
      country: place.countryName || '',
    }));
  } catch (error) {
    console.error('Skyscanner location search error:', error);
    return [];
  }
}
