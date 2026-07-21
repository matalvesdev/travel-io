import { apiClient, type ApiResponse } from './client';
import type { Goal } from '@/types/shared';

export type { Goal };

export interface GoalsResponse {
  goals: Goal[];
  totalGoals: number;
  activeGoals: number;
  totalTarget: number;
  totalProgress: number;
}

export const goalsApi = {
  getGoals: () =>
    apiClient.get<ApiResponse<GoalsResponse>>('/api/goals'),

  createGoal: (data: Partial<Goal>) =>
    apiClient.post<ApiResponse<Goal>>('/api/goals', data),

  updateGoal: (data: Partial<Goal> & { id: string }) =>
    apiClient.put<ApiResponse<Goal>>('/api/goals', data),

  deleteGoal: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/goals?id=${id}`),
};
