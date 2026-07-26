import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockTrip = {
  id: 'trip-1',
  userId: 'test-user-id',
  destination: 'Paris',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-07'),
};

const mockBooking = {
  id: 'booking-1',
  tripId: 'trip-1',
  userId: 'test-user-id',
  type: 'flight',
  status: 'confirmed',
  confirmationCode: 'ABC123',
  airline: 'LATAM',
  flightNumber: 'LA1234',
  origin: 'GRU',
  destination: 'CDG',
  price: 5000,
  currency: 'BRL',
};

// Mock Prisma
const mockPrisma = {
  trip: {
    findFirst: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe('Bookings API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.trip.findFirst.mockResolvedValue(mockTrip);
  });

  describe('GET /api/trips/[id]/bookings', () => {
    it('should return bookings for a trip', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([mockBooking]);

      const { GET } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookings).toHaveLength(1);
      expect(data.bookings[0].type).toBe('flight');
    });

    it('should return 404 if trip not found', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);

      const { GET } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings');
      const response = await GET(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toContain('não encontrada');
    });
  });

  describe('POST /api/trips/[id]/bookings', () => {
    it('should create a new booking', async () => {
      mockPrisma.booking.create.mockResolvedValue(mockBooking);

      const { POST } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'flight',
          confirmationCode: 'ABC123',
          airline: 'LATAM',
          flightNumber: 'LA1234',
          origin: 'GRU',
          destination: 'CDG',
          price: 5000,
        }),
      });
      const response = await POST(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.booking.type).toBe('flight');
    });

    it('should return 400 for invalid booking type', async () => {
      const { POST } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings', {
        method: 'POST',
        body: JSON.stringify({ type: 'invalid' }),
      });
      const response = await POST(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('inválido');
    });
  });

  describe('PUT /api/trips/[id]/bookings', () => {
    it('should update an existing booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(mockBooking);
      mockPrisma.booking.update.mockResolvedValue({ ...mockBooking, price: 6000 });

      const { PUT } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings', {
        method: 'PUT',
        body: JSON.stringify({ id: 'booking-1', price: 6000 }),
      });
      const response = await PUT(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking.price).toBe(6000);
    });

    it('should return 404 if booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      const { PUT } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings', {
        method: 'PUT',
        body: JSON.stringify({ id: 'nonexistent', price: 6000 }),
      });
      const response = await PUT(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/trips/[id]/bookings', () => {
    it('should delete a booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(mockBooking);
      mockPrisma.booking.delete.mockResolvedValue({});

      const { DELETE } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings?bookingId=booking-1');
      const response = await DELETE(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('sucesso');
    });

    it('should return 400 if bookingId missing', async () => {
      const { DELETE } = await import('@/app/api/trips/[id]/bookings/route');
      const request = new Request('http://localhost/api/trips/trip-1/bookings');
      const response = await DELETE(request as any, { params: Promise.resolve({ id: 'trip-1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
