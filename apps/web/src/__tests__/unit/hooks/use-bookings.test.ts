import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBookings, createBooking, updateBooking, cancelBooking, deleteBooking, fetchBookingSummary } from '@/hooks/api/use-bookings';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('use-bookings API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBookings', () => {
    it('should fetch bookings for a trip', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          bookings: [{ id: '1', type: 'flight', status: 'confirmed' }],
        }),
      });

      const result = await fetchBookings('trip-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings');
      expect(result.bookings).toHaveLength(1);
      expect(result.bookings[0].type).toBe('flight');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Erro' }),
      });

      await expect(fetchBookings('trip-1')).rejects.toThrow();
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          booking: { id: '1', type: 'flight', status: 'confirmed' },
        }),
      });

      const result = await createBooking('trip-1', {
        type: 'flight',
        airline: 'LATAM',
        price: 5000,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'flight', airline: 'LATAM', price: 5000 }),
      });
      expect(result.booking.type).toBe('flight');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Tipo inválido' }),
      });

      await expect(createBooking('trip-1', { type: 'invalid' as any })).rejects.toThrow('Tipo inválido');
    });
  });

  describe('updateBooking', () => {
    it('should update an existing booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          booking: { id: '1', type: 'flight', price: 6000 },
        }),
      });

      const result = await updateBooking('trip-1', { id: '1', price: 6000 });

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '1', price: 6000 }),
      });
      expect(result.booking.price).toBe(6000);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await cancelBooking('trip-1', 'booking-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings/booking-1/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await deleteBooking('trip-1', 'booking-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings?bookingId=booking-1', {
        method: 'DELETE',
      });
    });
  });

  describe('fetchBookingSummary', () => {
    it('should fetch booking summary', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: { totalSpent: 8000, flightCount: 1, hotelCount: 1 },
        }),
      });

      const result = await fetchBookingSummary('trip-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/trips/trip-1/bookings/summary');
      expect(result.summary.totalSpent).toBe(8000);
    });
  });
});
