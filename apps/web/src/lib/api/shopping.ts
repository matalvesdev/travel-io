import { apiClient, type ApiResponse } from './client';
import type {
  WishlistItem,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistResponse,
  PriceMonitor,
  CreateMonitorRequest,
  UpdateMonitorRequest,
  MonitorsResponse,
  Deal,
  DealsResponse,
  Coupon,
  CouponsResponse,
  PriceAlert,
  AlertsResponse,
  ScrapedProduct,
  SearchProductsResponse,
} from '@/types/shopping';

export type {
  WishlistItem,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistResponse,
  PriceMonitor,
  CreateMonitorRequest,
  UpdateMonitorRequest,
  MonitorsResponse,
  Deal,
  DealsResponse,
  Coupon,
  CouponsResponse,
  PriceAlert,
  AlertsResponse,
  ScrapedProduct,
  SearchProductsResponse,
};

export const shoppingApi = {
  // === Wishlist ===
  getWishlist: () =>
    apiClient.get<ApiResponse<WishlistResponse>>('/api/shopping/wishlist'),

  addToWishlist: (data: CreateWishlistItemRequest) =>
    apiClient.post<ApiResponse<WishlistItem>>('/api/shopping/wishlist', data),

  updateWishlistItem: (data: UpdateWishlistItemRequest) =>
    apiClient.patch<ApiResponse<WishlistItem>>('/api/shopping/wishlist', data),

  removeFromWishlist: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/shopping/wishlist?id=${id}`),

  // === Monitors ===
  getMonitors: () =>
    apiClient.get<ApiResponse<MonitorsResponse>>('/api/shopping/monitors'),

  addMonitor: (data: CreateMonitorRequest) =>
    apiClient.post<ApiResponse<PriceMonitor>>('/api/shopping/monitors', data),

  updateMonitor: (data: UpdateMonitorRequest) =>
    apiClient.patch<ApiResponse<PriceMonitor>>('/api/shopping/monitors', data),

  removeMonitor: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/shopping/monitors?id=${id}`),

  // === Deals ===
  getDeals: (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return apiClient.get<ApiResponse<DealsResponse>>(`/api/shopping/deals${query ? `?${query}` : ''}`);
  },

  // === Coupons ===
  getCoupons: (activeOnly = true) =>
    apiClient.get<ApiResponse<CouponsResponse>>(`/api/shopping/coupons?activeOnly=${activeOnly}`),

  // === Products (Scraper) ===
  searchProducts: (params: { q: string; store?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q);
    if (params.store) searchParams.set('store', params.store);
    return apiClient.get<ApiResponse<SearchProductsResponse>>(`/api/products?${searchParams.toString()}`);
  },

  // === Alerts ===
  getAlerts: () =>
    apiClient.get<ApiResponse<AlertsResponse>>('/api/shopping/alerts'),

  createAlert: (data: { name: string; type: string; store?: string; target_price: number }) =>
    apiClient.post<ApiResponse<PriceAlert>>('/api/shopping/alerts', data),

  removeAlert: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/shopping/alerts?id=${id}`),
};
