import { describe, it, expect, vi, beforeEach } from 'vitest';
import { travelApi } from '@/lib/api/travel';
import { mockTrip, mockTripFlight, mockTripHotel } from './__fixtures__/trips';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

describe('Travel API Client', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getTrips', () => {
    it('should call get /api/trips', async () => {
      (apiClient.get as any).mockResolvedValue({ data: { trips: [mockTrip] } });

      const result = await travelApi.getTrips();

      expect(apiClient.get).toHaveBeenCalledWith('/api/trips?status=ALL');
      expect(result.data.trips).toHaveLength(1);
    });

    it('should call get /api/trips with status filter', async () => {
      (apiClient.get as any).mockResolvedValue({ data: { trips: [mockTrip] } });

      const result = await travelApi.getTrips('planned');

      expect(apiClient.get).toHaveBeenCalledWith('/api/trips?status=planned');
      expect(result.data.trips).toHaveLength(1);
    });
  });

  describe('createTrip', () => {
    it('should call post /api/trips with data', async () => {
      const data = { name: 'Test trip', destination: 'GRU', startDate: '2026-12-15', endDate: '2026-12-30' };
      (apiClient.post as any).mockResolvedValue({ data: { id: 'new-trip-id' } });

      const result = await travelApi.createTrip(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/trips', data);
      expect(result.data.id).toBe('new-trip-id');
    });
  });

  describe('addTripFlight', () => {
    it('should call post /api/trips/flights with data', async () => {
      (apiClient.post as any).mockResolvedValue({ data: mockTripFlight });

      const result = await travelApi.addTripFlight({
        tripId: 'trip-1',
        airline: 'LATAM',
        origin: 'GRU',
        destination: 'CDG',
        departure: '2026-12-15T23:00:00Z',
        arrival: '2026-12-16T14:00:00Z',
        price: 5200,
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/trips/flights', {
        tripId: 'trip-1', airline: 'LATAM', origin: 'GRU', destination: 'CDG',
        departure: '2026-12-15T23:00:00Z', arrival: '2026-12-16T14:00:00Z', price: 5200,
      });
      expect(result.data.airline).toBe('LATAM');
    });
  });

  describe('addTripHotel', () => {
    it('should call post /api/trips/hotels with data', async () => {
      (apiClient.post as any).mockResolvedValue({ data: mockTripHotel });

      const result = await travelApi.addTripHotel({
        tripId: 'trip-1',
        name: 'Hotel Paris',
        price: 3300,
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/trips/hotels', {
        tripId: 'trip-1', name: 'Hotel Paris', price: 3300,
      });
      expect(result.data.name).toBe('Hotel Paris');
    });
  });
});
