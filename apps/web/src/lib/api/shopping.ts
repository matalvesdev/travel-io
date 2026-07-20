import { apiClient, type ApiResponse } from './client';
import type { Deal, Coupon } from '@/types/shared';

export type { Deal, Coupon };

export interface ShoppingWishlistItem {
  id: string;
  name: string;
  store: string;
  current_price: number;
  target_price: number;
  lowest_price: number;
  url: string;
  monitor_price: boolean;
  has_price_alert: boolean;
  image_url: string;
  created_at: string;
}

export interface DealsResponse {
  deals: Deal[];
}

export interface CouponsResponse {
  coupons: Coupon[];
}

export interface WishlistResponse {
  items: ShoppingWishlistItem[];
}

export const shoppingApi = {
  getWishlist: () =>
    apiClient.get<ApiResponse<WishlistResponse>>('/api/shopping/wishlist'),

  addToWishlist: (data: { name: string; store: string; current_price: number; target_price?: number; url?: string; image_url?: string }) =>
    apiClient.post<ApiResponse<ShoppingWishlistItem>>('/api/shopping/wishlist', data),

  removeFromWishlist: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/shopping/wishlist?id=${id}`),

  getDeals: (params?: { category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    return apiClient.get<ApiResponse<DealsResponse>>(`/api/shopping/deals${query ? `?${query}` : ''}`);
  },

  getCoupons: (activeOnly = true) =>
    apiClient.get<ApiResponse<CouponsResponse>>(`/api/shopping/coupons?activeOnly=${activeOnly}`),
};
