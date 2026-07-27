import { apiClient, type ApiResponse } from './client';
import type { Trip, CreateTripRequest, FlightSearchResult, LocationResult } from '@/types/shared';

export type { Trip, CreateTripRequest, FlightSearchResult, LocationResult };

export interface TripsResponse {
  trips: Trip[];
  total: number;
}

export const travelApi = {
  getTrips: (filter = 'ALL') =>
    apiClient.get<ApiResponse<TripsResponse>>(`/api/trips?status=${filter}`),

  createTrip: (data: CreateTripRequest) =>
    apiClient.post<ApiResponse<{ id: string }>>('/api/trips', data),

  searchFlights: (origin: string, destination: string, departureDate: string, adults = 1) =>
    apiClient.post<{ flights: FlightSearchResult[]; count: number }>(
      '/api/flights', { origin, destination, departureDate, adults }
    ),

  searchLocations: (keyword: string) =>
    apiClient.get<{ results: LocationResult[] }>(
      `/api/flights?q=${keyword}`
    ),

  addTripFlight: (data: {
    tripId: string; airline: string; flightNumber?: string;
    origin: string; destination: string; departure: string; arrival: string;
    price: number; currency?: string; duration?: string; stops?: number;
  }) => apiClient.post<ApiResponse<any>>('/api/trips/flights', data),

  addTripHotel: (data: {
    tripId: string; name: string; address?: string;
    price: number; currency?: string; rating?: number;
    checkIn?: string; checkOut?: string; guests?: number;
  }) => apiClient.post<ApiResponse<any>>('/api/trips/hotels', data),
};
