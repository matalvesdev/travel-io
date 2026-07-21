import { apiClient, type ApiResponse } from './client';
import type { Investment } from '@/types/shared';
import type { BrApiStockData } from '@/lib/api/brapi';

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

  updateInvestment: (id: string, data: Partial<Investment>) =>
    apiClient.put<ApiResponse<{ id: string }>>('/api/investments', { id, ...data }),

  deleteInvestment: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/investments?id=${id}`),

  getQuotes: (symbols: string) =>
    apiClient.get<{ results: BrApiStockData[] }>(`/api/brapi?symbols=${encodeURIComponent(symbols)}`),
};

export type { BrApiStockData } from '@/lib/api/brapi';
