'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '@/lib/api/client';
import type { Trip, FlightSearchResult, HotelSearchResult, LocationResult } from '@/types/shared';

export type { Trip, FlightSearchResult, HotelSearchResult, LocationResult };

// === API functions ===

export async function getTrips(filter?: string) {
  const query = filter ? `?status=${filter}` : '';
  return apiClient.get<ApiResponse<{ trips: Trip[]; total: number }>>(`/api/trips${query}`);
}

export async function createTrip(data: { name: string; destination: string; startDate: string; endDate: string; notes?: string }) {
  return apiClient.post<ApiResponse<{ tripId: string }>>('/api/trips', data);
}

export async function updateTrip(id: string, data: Partial<Trip>) {
  return apiClient.patch<ApiResponse<Trip>>(`/api/trips?id=${id}`, data);
}

export async function deleteTrip(id: string) {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/api/trips?id=${id}`);
}

export async function searchFlights(params: { origin: string; destination: string; departureDate: string; adults?: number }) {
  return apiClient.post<ApiResponse<{ flights: FlightSearchResult[]; count: number }>>('/api/flights', params);
}

export async function searchHotels(params: { destination: string; checkIn: string; checkOut: string; guests?: number }) {
  return apiClient.post<ApiResponse<{ hotels: HotelSearchResult[]; count: number }>>('/api/hotels', params);
}

export async function searchLocations(keyword: string) {
  return apiClient.get<ApiResponse<{ results: LocationResult[] }>>(`/api/flights?q=${encodeURIComponent(keyword)}`);
}

// === Hooks ===

export function useTrips(filter?: string) {
  return useQuery({
    queryKey: ['trips', filter],
    queryFn: () => getTrips(filter),
    select: (data) => data.data,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Trip> }) => updateTrip(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useFlightSearch(params: { origin: string; destination: string; departureDate: string; adults?: number } | null) {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: () => searchFlights(params!),
    enabled: false,
    select: (data) => data.data,
  });
}

export function useHotelSearch(params: { destination: string; checkIn: string; checkOut: string; guests?: number } | null) {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => searchHotels(params!),
    enabled: false,
    select: (data) => data.data,
  });
}

export function useLocationSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return useQuery({
    queryKey: ['locations', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    select: (data) => data.data.results,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFlightSearchTrigger() {
  const [params, setParams] = useState<{ origin: string; destination: string; departureDate: string; adults?: number } | null>(null);
  const query = useQuery({
    queryKey: ['flights', params],
    queryFn: () => searchFlights(params!),
    enabled: false,
    select: (data) => data.data,
  });

  const search = useCallback((newParams: { origin: string; destination: string; departureDate: string; adults?: number }) => {
    setParams(newParams);
  }, []);

  useEffect(() => {
    if (params) {
      query.refetch();
    }
  }, [params]);

  return { ...query, search };
}

export function useHotelSearchTrigger() {
  const [params, setParams] = useState<{ destination: string; checkIn: string; checkOut: string; guests?: number } | null>(null);
  const query = useQuery({
    queryKey: ['hotels', params],
    queryFn: () => searchHotels(params!),
    enabled: false,
    select: (data) => data.data,
  });

  const search = useCallback((newParams: { destination: string; checkIn: string; checkOut: string; guests?: number }) => {
    setParams(newParams);
  }, []);

  useEffect(() => {
    if (params) {
      query.refetch();
    }
  }, [params]);

  return { ...query, search };
}
