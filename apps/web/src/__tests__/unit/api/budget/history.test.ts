import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDate = new Date(2025, 2, 15);
vi.useFakeTimers();
vi.setSystemTime(mockDate);

const mockBudgetJan = [
  { id: 'b1', userId: 'test-user-id', category: 'Alimentação', limit: 1500, month: 1, year: 2025, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'b2', userId: 'test-user-id', category: 'Transporte', limit: 500, month: 1, year: 2025, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

const mockBudgetFeb = [
  { id: 'b3', userId: 'test-user-id', category: 'Alimentação', limit: 1600, month: 2, year: 2025, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
];

const mockTransactionsJan = [
  { id: 'tx-1', userId: 'test-user-id', category: 'Alimentação', amount: 300, date: new Date('2025-01-05') },
];

const mockTransactionsFeb = [
  { id: 'tx-2', userId: 'test-user-id', category: 'Alimentação', amount: 500, date: new Date('2025-02-10') },
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

describe('Budget History API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return history for months with budgets', async () => {
    mockPrisma.budget.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockBudgetFeb)
      .mockResolvedValueOnce(mockBudgetJan);
    for (let i = 0; i < 9; i++) {
      mockPrisma.budget.findMany.mockResolvedValueOnce([]);
    }

    mockPrisma.transaction.findMany
      .mockResolvedValueOnce(mockTransactionsFeb)
      .mockResolvedValueOnce(mockTransactionsJan);

    const { GET } = await import('@/app/api/budget/history/route');
    const request = new Request('http://localhost/api/budget/history');
    const response = await GET(request as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.history).toHaveLength(2);

    const latest = body.data.history[0];
    expect(latest.month).toBe(2);
    expect(latest.totalBudget).toBe(1600);
    expect(latest.totalSpent).toBe(500);

    const previous = body.data.history[1];
    expect(previous.month).toBe(1);
    expect(previous.totalBudget).toBe(2000);
    expect(previous.totalSpent).toBe(300);
  });

  it('should return empty array when no budget history exists', async () => {
    for (let i = 0; i < 12; i++) {
      mockPrisma.budget.findMany.mockResolvedValueOnce([]);
    }

    const { GET } = await import('@/app/api/budget/history/route');
    const request = new Request('http://localhost/api/budget/history');
    const response = await GET(request as any);
    const body = await response.json();

    expect(body.data.history).toHaveLength(0);
  });

  it('should include category breakdown per month', async () => {
    for (let i = 0; i < 12; i++) {
      if (i === 2) {
        mockPrisma.budget.findMany.mockResolvedValueOnce(mockBudgetJan);
      } else {
        mockPrisma.budget.findMany.mockResolvedValueOnce([]);
      }
    }
    mockPrisma.transaction.findMany
      .mockResolvedValueOnce(mockTransactionsJan);

    const { GET } = await import('@/app/api/budget/history/route');
    const request = new Request('http://localhost/api/budget/history');
    const response = await GET(request as any);
    const body = await response.json();

    const jan = body.data.history[0];
    expect(jan.categories).toHaveLength(2);
    expect(jan.categories[0].category).toBe('Alimentação');
    expect(jan.categories[0].budget).toBe(1500);
    expect(jan.categories[0].spent).toBe(300);
  });
});
