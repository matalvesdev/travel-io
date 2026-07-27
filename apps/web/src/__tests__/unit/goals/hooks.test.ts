import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useAddGoalProgress,
} from '@/hooks/api/use-goals';
import { goalsApi } from '@/lib/api';
import { mockGoalsData, mockGoal } from './__fixtures__/goals';

vi.mock('@/lib/api', () => ({
  goalsApi: {
    getGoals: vi.fn(),
    createGoal: vi.fn(),
    updateGoal: vi.fn(),
    deleteGoal: vi.fn(),
    addProgress: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Goals Hooks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('useGoals', () => {
    it('should fetch goals', async () => {
      (goalsApi.getGoals as any).mockResolvedValue({ data: mockGoalsData });

      const { result } = renderHook(() => useGoals(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(goalsApi.getGoals).toHaveBeenCalled();
    });
  });

  describe('useCreateGoal', () => {
    it('should create a goal', async () => {
      (goalsApi.createGoal as any).mockResolvedValue({ data: mockGoal });

      const { result } = renderHook(() => useCreateGoal(), { wrapper: createWrapper() });

      result.current.mutate({ name: 'New goal', targetAmount: 50000, type: 'TRAVEL', targetDate: '2027-01-01', priority: 'HIGH' });

      await waitFor(() => { expect(goalsApi.createGoal).toHaveBeenCalled(); });
      expect(goalsApi.createGoal).toHaveBeenCalledWith({ name: 'New goal', targetAmount: 50000, type: 'TRAVEL', targetDate: '2027-01-01', priority: 'HIGH' });
    });
  });

  describe('useUpdateGoal', () => {
    it('should update a goal', async () => {
      (goalsApi.updateGoal as any).mockResolvedValue({ data: { ...mockGoal, name: 'Updated' } });

      const { result } = renderHook(() => useUpdateGoal(), { wrapper: createWrapper() });

      result.current.mutate({ id: 'goal-1', name: 'Updated' });

      await waitFor(() => { expect(goalsApi.updateGoal).toHaveBeenCalled(); });
      expect(goalsApi.updateGoal).toHaveBeenCalledWith({ id: 'goal-1', name: 'Updated' });
    });
  });

  describe('useDeleteGoal', () => {
    it('should delete a goal', async () => {
      (goalsApi.deleteGoal as any).mockResolvedValue({});

      const { result } = renderHook(() => useDeleteGoal(), { wrapper: createWrapper() });

      result.current.mutate('goal-1');

      await waitFor(() => { expect(goalsApi.deleteGoal).toHaveBeenCalledWith('goal-1'); });
    });
  });

  describe('useAddGoalProgress', () => {
    it('should add progress to a goal', async () => {
      (goalsApi.addProgress as any).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useAddGoalProgress(), { wrapper: createWrapper() });

      result.current.mutate({ goalId: 'goal-1', amount: 1000, description: 'Mensal' });

      await waitFor(() => { expect(goalsApi.addProgress).toHaveBeenCalled(); });
      expect(goalsApi.addProgress).toHaveBeenCalledWith({ goalId: 'goal-1', amount: 1000, description: 'Mensal' });
    });
  });
});
