import { apiClient, type ApiResponse } from './client';
import type { MilesAccount } from '@travelio/shared';

export type { MilesAccount };

export interface MilesBalanceResponse {
  programs: MilesAccount[];
  transactions: { id: string; description: string; amount: number; date: string; type: string }[];
  totalMiles: number;
  totalExpiring: number;
}

export const milesApi = {
  getBalance: (program?: string) => {
    const query = program ? `?program=${program}` : '';
    return apiClient.get<ApiResponse<MilesBalanceResponse>>(`/api/miles${query}`);
  },

  linkAccount: (data: { program: string; accountNumber: string; miles: number }) =>
    apiClient.post<ApiResponse<MilesAccount>>('/api/miles', data),

  updateAccount: (data: Partial<MilesAccount> & { id: string }) =>
    apiClient.put<ApiResponse<MilesAccount>>('/api/miles', data),
};
