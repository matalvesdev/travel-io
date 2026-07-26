import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDate = new Date(2025, 0, 15);
vi.useFakeTimers();
vi.setSystemTime(mockDate);

const mockBudgets = [
  { id: 'b1', userId: 'test-user-id', category: 'Alimentação', limit: 1500, month: 1, year: 2025, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'b2', userId: 'test-user-id', category: 'Transporte', limit: 500, month: 1, year: 2025, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

const mockTransactions = [
  { id: 'tx-1', userId: 'test-user-id', category: 'Alimentação', amount: 300, date: new Date('2025-01-05') },
  { id: 'tx-2', userId: 'test-user-id', category: 'Alimentação', amount: 200, date: new Date('2025-01-10') },
];

const mockPrisma = {
  budget: { findMany: vi.fn() },
  transaction: { findMany: vi.fn() },
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

describe('Budget Summary API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return summary with total budget vs spent', async () => {
    mockPrisma.budget.findMany.mockResolvedValue(mockBudgets);
    mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const { GET } = await import('@/app/api/budget/summary/route');
    const request = new Request('http://localhost/api/budget/summary?month=1&year=2025');
    const response = await GET(request as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalBudget).toBe(2000);
    expect(body.data.totalSpent).toBe(500);
    expect(body.data.percentage).toBeCloseTo(25, 1);
    expect(body.data.status).toBe('safe');
  });

  it('should return empty summary when there are no budgets', async () => {
    mockPrisma.budget.findMany.mockResolvedValue([]);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/budget/summary/route');
    const request = new Request('http://localhost/api/budget/summary?month=1&year=2025');
    const response = await GET(request as any);
    const body = await response.json();

    expect(body.data.totalBudget).toBe(0);
    expect(body.data.totalSpent).toBe(0);
    expect(body.data.categories).toHaveLength(0);
  });

  it('should calculate danger status when overspent', async () => {
    const lowBudget = [{ ...mockBudgets[0], limit: 100 }];
    mockPrisma.budget.findMany.mockResolvedValue(lowBudget);
    mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const { GET } = await import('@/app/api/budget/summary/route');
    const request = new Request('http://localhost/api/budget/summary?month=1&year=2025');
    const response = await GET(request as any);
    const body = await response.json();

    expect(body.data.status).toBe('danger');
  });

  it('should include per-category breakdown', async () => {
    mockPrisma.budget.findMany.mockResolvedValue(mockBudgets);
    mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const { GET } = await import('@/app/api/budget/summary/route');
    const request = new Request('http://localhost/api/budget/summary?month=1&year=2025');
    const response = await GET(request as any);
    const body = await response.json();

    expect(body.data.categories).toHaveLength(2);
    const alimentacao = body.data.categories.find((c: any) => c.category === 'Alimentação');
    expect(alimentacao.spent).toBe(500);
    expect(alimentacao.remaining).toBe(1000);
  });
});
