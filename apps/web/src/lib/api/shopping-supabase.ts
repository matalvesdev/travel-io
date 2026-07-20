import { apiClient, type ApiResponse } from './client';

export interface Deal {
  id: string;
  product_name: string;
  store_name: string;
  original_price: number;
  deal_price: number;
  savings: number;
  url: string;
  is_active: boolean;
  category: string;
  image_url: string;
  expires_at: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  store_name: string;
  code: string;
  description: string;
  value: number;
  min_purchase: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface WishlistItem {
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

export const shoppingSupabase = {
  async getDeals(category?: string, limit = 20): Promise<Deal[]> {
    const query = category && category !== 'all' ? `?category=${category}&limit=${limit}` : `?limit=${limit}`;
    const res = await apiClient.get<ApiResponse<{ deals: Deal[] }>>(`/api/shopping/deals${query}`);
    return res.data?.deals || [];
  },

  async searchDeals(query: string): Promise<Deal[]> {
    const res = await apiClient.get<ApiResponse<{ deals: Deal[] }>>(`/api/shopping/deals?search=${encodeURIComponent(query)}`);
    return res.data?.deals || [];
  },

  async getCoupons(activeOnly = true): Promise<Coupon[]> {
    const res = await apiClient.get<ApiResponse<{ coupons: Coupon[] }>>(`/api/shopping/coupons?activeOnly=${activeOnly}`);
    return res.data?.coupons || [];
  },

  async getWishlist(): Promise<WishlistItem[]> {
    const res = await apiClient.get<ApiResponse<{ items: WishlistItem[] }>>('/api/shopping/wishlist');
    return res.data?.items || [];
  },

  async addToWishlist(item: { name: string; store: string; current_price: number; target_price?: number; url?: string; image_url?: string }) {
    return apiClient.post<ApiResponse<WishlistItem>>('/api/shopping/wishlist', item);
  },

  async removeFromWishlist(id: string) {
    return apiClient.delete(`/api/shopping/wishlist?id=${id}`);
  },

  async getMonitors(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<{ monitors: any[] }>>('/api/shopping/monitors');
    return res.data?.monitors || [];
  },

  async addMonitor(item: { product_name: string; url: string; target_price: number }) {
    return apiClient.post<ApiResponse<any>>('/api/shopping/monitors', item);
  },

  async removeMonitor(id: string) {
    return apiClient.delete(`/api/shopping/monitors?id=${id}`);
  },
};
