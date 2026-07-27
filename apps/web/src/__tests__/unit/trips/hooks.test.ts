import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTrips,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useAddTripFlight,
  useAddTripHotel,
} from '@/hooks/api/use-travel';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Travel Hooks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('useTrips', () => {
    it('should fetch trips', async () => {
      (apiClient.get as any).mockResolvedValue({ success: true, data: { trips: [{ id: '1', name: 'Test' }], total: 1 } });

      const { result } = renderHook(() => useTrips(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(result.current.data?.trips).toHaveLength(1);
    });
  });

  describe('useCreateTrip', () => {
    it('should create a trip', async () => {
      (apiClient.post as any).mockResolvedValue({ success: true, data: { id: 'new-id' } });

      const { result } = renderHook(() => useCreateTrip(), { wrapper: createWrapper() });

      result.current.mutate({ name: 'Test', destination: 'GRU', startDate: '2026-01-01', endDate: '2026-01-10' });

      await waitFor(() => { expect(apiClient.post).toHaveBeenCalled(); });
      expect(apiClient.post).toHaveBeenCalledWith('/api/trips', { name: 'Test', destination: 'GRU', startDate: '2026-01-01', endDate: '2026-01-10' });
    });
  });

  describe('useUpdateTrip', () => {
    it('should update a trip', async () => {
      (apiClient.patch as any).mockResolvedValue({ success: true, data: { id: 'trip-1', status: 'completed' } });

      const { result } = renderHook(() => useUpdateTrip(), { wrapper: createWrapper() });

      result.current.mutate({ id: 'trip-1', data: { status: 'completed' } });

      await waitFor(() => { expect(apiClient.patch).toHaveBeenCalled(); });
      expect(apiClient.patch).toHaveBeenCalledWith('/api/trips?id=trip-1', { status: 'completed' });
    });
  });

  describe('useDeleteTrip', () => {
    it('should delete a trip', async () => {
      (apiClient.delete as any).mockResolvedValue({ success: true, message: 'Viagem excluída' });

      const { result } = renderHook(() => useDeleteTrip(), { wrapper: createWrapper() });

      result.current.mutate('trip-1');

      await waitFor(() => { expect(apiClient.delete).toHaveBeenCalledWith('/api/trips?id=trip-1'); });
    });
  });

  describe('useAddTripFlight', () => {
    it('should add a flight to a trip', async () => {
      (apiClient.post as any).mockResolvedValue({ success: true, data: { id: 'flight-1' } });

      const { result } = renderHook(() => useAddTripFlight(), { wrapper: createWrapper() });

      result.current.mutate({ tripId: 'trip-1', airline: 'LATAM', origin: 'GRU', destination: 'CDG', departure: '2026-01-01', arrival: '2026-01-01', price: 1000 });

      await waitFor(() => { expect(apiClient.post).toHaveBeenCalled(); });
      expect(apiClient.post).toHaveBeenCalledWith('/api/trips/flights', { tripId: 'trip-1', airline: 'LATAM', origin: 'GRU', destination: 'CDG', departure: '2026-01-01', arrival: '2026-01-01', price: 1000 });
    });
  });

  describe('useAddTripHotel', () => {
    it('should add a hotel to a trip', async () => {
      (apiClient.post as any).mockResolvedValue({ success: true, data: { id: 'hotel-1' } });

      const { result } = renderHook(() => useAddTripHotel(), { wrapper: createWrapper() });

      result.current.mutate({ tripId: 'trip-1', name: 'Hotel Paris', price: 500 });

      await waitFor(() => { expect(apiClient.post).toHaveBeenCalled(); });
      expect(apiClient.post).toHaveBeenCalledWith('/api/trips/hotels', { tripId: 'trip-1', name: 'Hotel Paris', price: 500 });
    });
  });
});
