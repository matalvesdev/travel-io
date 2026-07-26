import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetApi } from '@/lib/api/budget';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockApiResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: async () => data,
  });

describe('budgetApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBudgets', () => {
    it('should fetch budgets for a month/year', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: {
          budgets: [{ id: '1', category: 'Alimentação', limit: 1500, spent: 500, status: 'safe' }],
        },
      }));

      const result = await budgetApi.getBudgets(1, 2025);

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget?month=1&year=2025');
      expect(result.data.budgets).toHaveLength(1);
      expect(result.data.budgets[0].category).toBe('Alimentação');
    });
  });

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: { id: '1', limit: 1500 },
      }));

      const result = await budgetApi.createBudget({ category: 'Alimentação', limit: 1500, month: 1, year: 2025 });

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget');
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
        category: 'Alimentação', limit: 1500, month: 1, year: 2025,
      });
      expect(result.data.id).toBe('1');
    });
  });

  describe('updateBudget', () => {
    it('should update an existing budget', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: { id: '1', limit: 2000 },
      }));

      const result = await budgetApi.updateBudget({ id: '1', limit: 2000 });

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget');
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ id: '1', limit: 2000 });
      expect(result.data.limit).toBe(2000);
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget by id', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: { message: 'Orçamento excluído' },
      }));

      const result = await budgetApi.deleteBudget('1');

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget?id=1');
      expect(result.data.message).toBe('Orçamento excluído');
    });
  });

  describe('getSummary', () => {
    it('should fetch budget summary', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: { totalBudget: 2000, totalSpent: 500, status: 'safe', categories: [] },
      }));

      const result = await budgetApi.getSummary(1, 2025);

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget/summary?month=1&year=2025');
      expect(result.data.totalBudget).toBe(2000);
      expect(result.data.totalSpent).toBe(500);
    });
  });

  describe('getHistory', () => {
    it('should fetch budget history', async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse({
        success: true,
        data: { history: [{ month: 1, year: 2025, totalBudget: 2000, totalSpent: 300, categories: [] }] },
      }));

      const result = await budgetApi.getHistory();

      expect(mockFetch.mock.calls[0][0]).toBe('/api/budget/history');
      expect(result.data.history).toHaveLength(1);
    });
  });
});
