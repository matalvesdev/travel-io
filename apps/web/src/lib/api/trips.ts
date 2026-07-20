import { apiClient, type ApiResponse } from './client';

export interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  notes?: string;
}

export interface TripsResponse {
  trips: Trip[];
}

export const tripsApi = {
  getTrips: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<ApiResponse<TripsResponse>>(`/api/trips${query}`);
  },

  createTrip: (data: Partial<Trip>) =>
    apiClient.post<ApiResponse<Trip>>('/api/trips', data),

  deleteTrip: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/trips?id=${id}`),
};
