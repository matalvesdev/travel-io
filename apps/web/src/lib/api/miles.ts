import { apiClient, type ApiResponse } from './client';
import type { MilesAccount, MilesTransfer, MilesPromotion } from '@/types/shared';

export type { MilesAccount, MilesTransfer, MilesPromotion };

export interface TransferRoute {
  id: string;
  fromProgram: string;
  toProgram: string;
  conversionRate: number;
  minTransfer: number;
  maxTransfer: number | null;
  isActive: boolean;
}

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
    apiClient.patch<ApiResponse<MilesAccount>>('/api/miles', data),

  deleteAccount: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/miles?id=${id}`),

  transferMiles: (data: { fromProgram: string; toProgram: string; miles: number }) =>
    apiClient.post<ApiResponse<MilesTransfer>>('/api/miles/transfer', data),

  getPromotions: () =>
    apiClient.get<ApiResponse<MilesPromotion[]>>('/api/miles/promotions'),

  getTransferHistory: () =>
    apiClient.get<ApiResponse<MilesTransfer[]>>('/api/miles/transfer?history=true'),

  getTransferRoutes: () =>
    apiClient.get<ApiResponse<TransferRoute[]>>('/api/miles/transfer/routes'),

  searchSkyscannerFlights: (params: { origin: string; destination: string; date: string; adults?: number }) =>
    apiClient.post<ApiResponse<{ flights: { id: string; airline: string; price: number; currency: string; departureTime: string; arrivalTime: string; duration: string; stops: number; deepLink: string }[] }>>('/api/flights/search', params),

  scrapeMilesFlights: (params: { origin: string; destination: string; date: string; adults?: number }) => {
    const query = `origin=${params.origin}&destination=${params.destination}&date=${params.date}${params.adults ? `&adults=${params.adults}` : ''}`;
    return apiClient.get<ApiResponse<{ offers: { program: string; miles: number; taxes: number; airline: string; origin: string; destination: string; departureTime: string; arrivalTime: string; duration: string; stops: number; cabin: string; deepLink: string; source: string }[]; cheapest: { program: string; miles: number; taxes: number } | null; source: string }>>(`/api/miles/scrape?${query}`);
  },
};
