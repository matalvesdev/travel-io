import { apiClient, type ApiResponse } from './client';
import type { MilesAccount, Promotion } from '@/types/shared';

export type { MilesAccount, Promotion };

export interface MilesBalanceResponse {
  programs: MilesAccount[];
  transactions: { id: string; description: string; amount: number; date: string; type: string }[];
  totalMiles: number;
  totalExpiring: number;
}

export interface MilesPromotion extends Promotion {}

export const milesApi = {
  getBalance: (program?: string) => {
    const query = program ? `?program=${program}` : '';
    return apiClient.get<ApiResponse<MilesBalanceResponse>>(`/api/miles${query}`);
  },

  getPromotions: () =>
    apiClient.get<ApiResponse<MilesPromotion[]>>('/api/miles/promotions'),

  getTransferHistory: () =>
    apiClient.get<ApiResponse<{ id: string; from: string; to: string; amount: number; result: number; date: string; status: string }[]>>('/api/miles/transfers'),

  linkAccount: (data: { program: string; accountNumber: string; miles: number }) =>
    apiClient.post<ApiResponse<MilesAccount>>('/api/miles', data),

  updateAccount: (data: Partial<MilesAccount> & { id: string }) =>
    apiClient.put<ApiResponse<MilesAccount>>('/api/miles', data),

  transferMiles: (data: { from: string; to: string; amount: number }) =>
    apiClient.post<ApiResponse<{ result: number; conversionRate: number }>>('/api/miles/transfer', data),
};
