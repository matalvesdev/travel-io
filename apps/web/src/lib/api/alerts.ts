import { apiClient, type ApiResponse } from './client';

export interface PriceAlert {
  id: string;
  name: string;
  type: 'flight' | 'hotel';
  origin?: string;
  destination: string;
  checkin: string;
  checkout: string;
  store: string;
  current_price: number;
  target_price: number;
  history: { price: number; date: string }[];
  active: boolean;
  trip_id?: string;
}

export interface AlertsResponse {
  alerts: PriceAlert[];
}

export const alertsApi = {
  getAlerts: () =>
    apiClient.get<ApiResponse<AlertsResponse>>('/api/alerts'),

  createAlert: (data: Partial<PriceAlert>) =>
    apiClient.post<ApiResponse<PriceAlert>>('/api/alerts', data),

  updateAlert: (data: Partial<PriceAlert> & { id: string }) =>
    apiClient.put<ApiResponse<PriceAlert>>('/api/alerts', data),

  deleteAlert: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/alerts?id=${id}`),
};
