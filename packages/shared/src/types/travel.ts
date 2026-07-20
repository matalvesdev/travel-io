export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  totalCost: number;
  notes: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  imageUrl: string;
  amenities: string[];
}

export interface CreateTripRequest {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface CreateFlightRequest {
  tripId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency?: string;
}

export interface CreateHotelRequest {
  tripId: string;
  name: string;
  address: string;
  price: number;
  rating?: number;
}

export interface CreatePriceAlertRequest {
  origin: string;
  destination: string;
  targetPrice: number;
  currency?: string;
}

export interface FlightSearchResult {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber: string;
  stops: number;
  duration: string;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  address: string;
  price: number;
  currency: string;
  rating: number;
  amenities: string[];
}

export interface LocationResult {
  id: string;
  name: string;
  iataCode: string;
  type: string;
  cityName: string;
  countryName: string;
}
