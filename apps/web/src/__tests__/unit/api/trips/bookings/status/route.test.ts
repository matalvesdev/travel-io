import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockBooking = {
  id: 'booking-1',
  tripId: 'trip-1',
  userId: 'test-user-id',
  type: 'flight',
  status: 'confirmed',
};

// Mock Prisma
const mockPrisma = {
  booking: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

// Mock authenticatedHandler
vi.mock('@/lib/api/supabase-helpers', () => ({
  authenticatedHandler: vi.fn((request: any, handler: any) =>
    handler({ request, userId: 'test-user-id', supabase: {} })
  ),
}));

describe('Booking Status API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/trips/[id]/bookings/[bookingId]/status', () => {
    it('should update booking status to cancelled', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(mockBooking);
      mockPrisma.booking.update.mockResolvedValue({ ...mockBooking, status: 'cancelled' });

      const { PATCH } = await import('@/app/api/trips/[id]/bookings/[bookingId]/status/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/booking-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const response = await PATCH(request as any, {
        params: Promise.resolve({ id: 'trip-1', bookingId: 'booking-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking.status).toBe('cancelled');
    });

    it('should update booking status to completed', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(mockBooking);
      mockPrisma.booking.update.mockResolvedValue({ ...mockBooking, status: 'completed' });

      const { PATCH } = await import('@/app/api/trips/[id]/bookings/[bookingId]/status/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/booking-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      const response = await PATCH(request as any, {
        params: Promise.resolve({ id: 'trip-1', bookingId: 'booking-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking.status).toBe('completed');
    });

    it('should return 400 for invalid status', async () => {
      const { PATCH } = await import('@/app/api/trips/[id]/bookings/[bookingId]/status/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/booking-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid' }),
      });
      const response = await PATCH(request as any, {
        params: Promise.resolve({ id: 'trip-1', bookingId: 'booking-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('inválido');
    });

    it('should return 404 if booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      const { PATCH } = await import('@/app/api/trips/[id]/bookings/[bookingId]/status/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/booking-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const response = await PATCH(request as any, {
        params: Promise.resolve({ id: 'trip-1', bookingId: 'booking-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toContain('não encontrada');
    });
  });
});
