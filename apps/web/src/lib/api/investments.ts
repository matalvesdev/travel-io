import { apiClient, type ApiResponse } from './client';
import type { Investment } from '@/types/shared';

export type { Investment };

export interface PortfolioResponse {
  investments: Investment[];
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  allocation: { type: string; percentage: number; amount: number }[];
}

export const investmentsApi = {
  getPortfolio: () =>
    apiClient.get<ApiResponse<PortfolioResponse>>('/api/investments'),

  createInvestment: (data: Partial<Investment>) =>
    apiClient.post<ApiResponse<{ id: string }>>('/api/investments', data),

  deleteInvestment: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/investments?id=${id}`),
};
