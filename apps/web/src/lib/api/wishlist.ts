import { apiClient, type ApiResponse } from './client';

export interface WishlistResponse {
  items: Array<{
    id: string;
    userId: string;
    type: 'flight' | 'hotel' | 'destination';
    name: string;
    notes: string | null;
    targetPrice: number | null;
    currentPrice: number | null;
    currency: string;
    origin: string | null;
    destination: string | null;
    airline: string | null;
    flightNumber: string | null;
    departureDate: string | null;
    hotelName: string | null;
    hotelAddress: string | null;
    checkIn: string | null;
    checkOut: string | null;
    nights: number | null;
    roomType: string | null;
    country: string | null;
    imageUrl: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const wishlistApi = {
  getItems: (type?: string) => {
    const params = type ? `?type=${type}` : '';
    return apiClient.get<ApiResponse<WishlistResponse>>(`/api/wishlist${params}`);
  },

  createItem: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Record<string, unknown>>>('/api/wishlist', data),

  updateItem: (data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Record<string, unknown>>>('/api/wishlist', data),

  deleteItem: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/wishlist?id=${id}`),
};
