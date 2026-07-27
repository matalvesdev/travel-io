import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalsApi } from '@/lib/api/goals';
import { mockGoalsData, mockGoal, mockGoalProgress } from './__fixtures__/goals';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

describe('Goals API Client', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getGoals', () => {
    it('should call get /api/goals', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockGoalsData });

      const result = await goalsApi.getGoals();

      expect(apiClient.get).toHaveBeenCalledWith('/api/goals');
      expect(result).toEqual({ data: mockGoalsData });
    });
  });

  describe('createGoal', () => {
    it('should call post /api/goals with data', async () => {
      const data = { name: 'New goal', targetAmount: 10000, type: 'SAVINGS', targetDate: '2027-01-01', priority: 'MEDIUM' };
      (apiClient.post as any).mockResolvedValue({ data: mockGoal });

      const result = await goalsApi.createGoal(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/goals', data);
      expect(result).toEqual({ data: mockGoal });
    });
  });

  describe('updateGoal', () => {
    it('should call put /api/goals with data', async () => {
      const data = { id: 'goal-1', name: 'Updated goal', targetAmount: 60000 };
      (apiClient.put as any).mockResolvedValue({ data: { ...mockGoal, name: 'Updated goal' } });

      const result = await goalsApi.updateGoal(data);

      expect(apiClient.put).toHaveBeenCalledWith('/api/goals', data);
      expect(result).toEqual({ data: { ...mockGoal, name: 'Updated goal' } });
    });
  });

  describe('deleteGoal', () => {
    it('should call delete /api/goals?id=', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: { message: 'Meta excluída' } });

      const result = await goalsApi.deleteGoal('goal-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/goals?id=goal-1');
      expect(result).toEqual({ data: { message: 'Meta excluída' } });
    });
  });

  describe('addProgress', () => {
    it('should call post /api/goals/progress with data', async () => {
      const data = { goalId: 'goal-1', amount: 1000, description: 'Mensal' };
      (apiClient.post as any).mockResolvedValue({ data: mockGoalProgress });

      const result = await goalsApi.addProgress(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/goals/progress', data);
      expect(result).toEqual({ data: mockGoalProgress });
    });
  });
});
