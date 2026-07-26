import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDate = new Date(2025, 0, 15);
vi.useFakeTimers();
vi.setSystemTime(mockDate);

const mockBudgets = [
  {
    id: 'budget-1',
    userId: 'test-user-id',
    category: 'Alimentação',
    limit: 1500,
    month: 1,
    year: 2025,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'budget-2',
    userId: 'test-user-id',
    category: 'Transporte',
    limit: 500,
    month: 1,
    year: 2025,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockTransactions = [
  { id: 'tx-1', userId: 'test-user-id', category: 'Alimentação', amount: 300, date: new Date('2025-01-05') },
  { id: 'tx-2', userId: 'test-user-id', category: 'Alimentação', amount: 200, date: new Date('2025-01-10') },
  { id: 'tx-3', userId: 'test-user-id', category: 'Transporte', amount: 100, date: new Date('2025-01-08') },
];

const mockPrisma = {
  budget: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

vi.mock('@/lib/api/supabase-helpers', () => ({
  authenticatedHandler: vi.fn((request: any, handler: any) =>
    handler({ request, userId: 'test-user-id', supabase: {} })
  ),
}));

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

describe('Budget API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/budget', () => {
    it('should return budgets with spending calculation', async () => {
      mockPrisma.budget.findMany.mockResolvedValue(mockBudgets);
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const { GET } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget?month=1&year=2025');
      const response = await GET(request as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.budgets).toHaveLength(2);

      const alimentacao = body.data.budgets.find((b: any) => b.category === 'Alimentação');
      expect(alimentacao.spent).toBe(500);
      expect(alimentacao.remaining).toBe(1000);
      expect(alimentacao.percentage).toBeCloseTo(33.33, 1);
      expect(alimentacao.status).toBe('safe');
    });

    it('should use current month/year when not specified', async () => {
      mockPrisma.budget.findMany.mockResolvedValue([]);
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const { GET } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget');
      const response = await GET(request as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.budget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ month: 1, year: 2025 }),
        })
      );
    });

    it('should calculate danger status when overspent', async () => {
      const overspentBudget = [{ ...mockBudgets[0], limit: 100 }];
      mockPrisma.budget.findMany.mockResolvedValue(overspentBudget);
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const { GET } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget?month=1&year=2025');
      const response = await GET(request as any);
      const body = await response.json();

      expect(body.data.budgets[0].status).toBe('danger');
      expect(body.data.budgets[0].percentage).toBeGreaterThan(100);
    });
  });

  describe('POST /api/budget', () => {
    it('should create a new budget', async () => {
      mockPrisma.budget.upsert.mockResolvedValue(mockBudgets[0]);

      const { POST } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'POST',
        body: JSON.stringify({ category: 'Alimentação', limit: 1500, month: 1, year: 2025 }),
      });
      const response = await POST(request as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.limit).toBe(1500);
    });

    it('should upsert existing budget for same category', async () => {
      mockPrisma.budget.upsert.mockResolvedValue({ ...mockBudgets[0], limit: 2000 });

      const { POST } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'POST',
        body: JSON.stringify({ category: 'Alimentação', limit: 2000, month: 1, year: 2025 }),
      });
      const response = await POST(request as any);
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data.limit).toBe(2000);
      expect(mockPrisma.budget.upsert).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const { POST } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'POST',
        body: JSON.stringify({ category: 'Alimentação' }),
      });
      const response = await POST(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should return 400 when limit is zero or negative', async () => {
      const { POST } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'POST',
        body: JSON.stringify({ category: 'Alimentação', limit: 0, month: 1, year: 2025 }),
      });
      const response = await POST(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('PUT /api/budget', () => {
    it('should update an existing budget', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(mockBudgets[0]);
      mockPrisma.budget.update.mockResolvedValue({ ...mockBudgets[0], limit: 2000 });

      const { PUT } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'PUT',
        body: JSON.stringify({ id: 'budget-1', limit: 2000 }),
      });
      const response = await PUT(request as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.limit).toBe(2000);
    });

    it('should return 404 when budget not found', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(null);

      const { PUT } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget', {
        method: 'PUT',
        body: JSON.stringify({ id: 'nonexistent', limit: 2000 }),
      });
      const response = await PUT(request as any);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
    });
  });

  describe('DELETE /api/budget', () => {
    it('should delete an existing budget', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(mockBudgets[0]);
      mockPrisma.budget.delete.mockResolvedValue(mockBudgets[0]);

      const { DELETE } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget?id=budget-1');
      const response = await DELETE(request as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should return 400 when id is missing', async () => {
      const { DELETE } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget');
      const response = await DELETE(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should return 404 when budget not found', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(null);

      const { DELETE } = await import('@/app/api/budget/route');
      const request = new Request('http://localhost/api/budget?id=nonexistent');
      const response = await DELETE(request as any);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
    });
  });
});
