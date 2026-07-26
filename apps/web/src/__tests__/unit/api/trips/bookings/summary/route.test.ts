import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockTrip = {
  id: 'trip-1',
  userId: 'test-user-id',
  destination: 'Paris',
  budget: 10000,
};

const mockBookings = [
  { id: '1', type: 'flight', status: 'confirmed', price: 5000 },
  { id: '2', type: 'hotel', status: 'confirmed', price: 3000 },
  { id: '3', type: 'flight', status: 'cancelled', price: 0 },
];

// Mock Prisma
const mockPrisma = {
  trip: {
    findFirst: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
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

describe('Booking Summary API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.trip.findFirst.mockResolvedValue(mockTrip);
    mockPrisma.booking.findMany.mockResolvedValue(mockBookings);
  });

  describe('GET /api/trips/[id]/bookings/summary', () => {
    it('should return financial summary', async () => {
      const { GET } = await import('@/app/api/trips/[id]/bookings/summary/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/summary');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.totalSpent).toBe(8000);
      expect(data.summary.flightCount).toBe(2);
      expect(data.summary.hotelCount).toBe(1);
      expect(data.summary.confirmedCount).toBe(2);
      expect(data.summary.cancelledCount).toBe(1);
      expect(data.summary.budget).toBe(10000);
      expect(data.summary.remaining).toBe(2000);
      expect(data.summary.isOverBudget).toBe(false);
    });

    it('should detect over budget', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        { id: '1', type: 'flight', status: 'confirmed', price: 6000 },
        { id: '2', type: 'hotel', status: 'confirmed', price: 5000 },
      ]);

      const { GET } = await import('@/app/api/trips/[id]/bookings/summary/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/summary');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(data.summary.totalSpent).toBe(11000);
      expect(data.summary.isOverBudget).toBe(true);
      expect(data.summary.remaining).toBe(-1000);
    });

    it('should handle empty bookings', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const { GET } = await import('@/app/api/trips/[id]/bookings/summary/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/summary');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(data.summary.totalSpent).toBe(0);
      expect(data.summary.flightCount).toBe(0);
      expect(data.summary.hotelCount).toBe(0);
    });

    it('should return 404 if trip not found', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);

      const { GET } = await import('@/app/api/trips/[id]/bookings/summary/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings/summary');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
