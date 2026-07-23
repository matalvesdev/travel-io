import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shoppingApi } from '@/lib/api/shopping';

// Mock the apiClient
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

describe('Shopping API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should call get endpoint', async () => {
      const mockResponse = { data: { items: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.getWishlist();

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/wishlist');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addToWishlist', () => {
    it('should call post endpoint with data', async () => {
      const mockData = { name: 'iPhone 15', store: 'Amazon', current_price: 8999 };
      const mockResponse = { data: { id: '1', ...mockData } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.addToWishlist(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/shopping/wishlist', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateWishlistItem', () => {
    it('should call patch endpoint with data', async () => {
      const mockData = { id: '1', target_price: 7999 };
      const mockResponse = { data: { id: '1', targetPrice: 7999 } };
      (apiClient.patch as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.updateWishlistItem(mockData);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/shopping/wishlist', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeFromWishlist', () => {
    it('should call delete endpoint with id', async () => {
      const mockResponse = { data: { message: 'Removed' } };
      (apiClient.delete as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.removeFromWishlist('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/shopping/wishlist?id=1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMonitors', () => {
    it('should call get endpoint', async () => {
      const mockResponse = { data: { monitors: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.getMonitors();

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/monitors');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addMonitor', () => {
    it('should call post endpoint with data', async () => {
      const mockData = { product_name: 'iPhone 15', url: 'https://amazon.com', target_price: 7999 };
      const mockResponse = { data: { id: '1', ...mockData } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.addMonitor(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/shopping/monitors', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateMonitor', () => {
    it('should call patch endpoint with data', async () => {
      const mockData = { id: '1', current_price: 8499 };
      const mockResponse = { data: { id: '1', currentPrice: 8499 } };
      (apiClient.patch as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.updateMonitor(mockData);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/shopping/monitors', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeMonitor', () => {
    it('should call delete endpoint with id', async () => {
      const mockResponse = { data: { message: 'Removed' } };
      (apiClient.delete as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.removeMonitor('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/shopping/monitors?id=1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDeals', () => {
    it('should call get endpoint', async () => {
      const mockResponse = { data: { deals: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.getDeals();

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/deals');
      expect(result).toEqual(mockResponse);
    });

    it('should call get endpoint with category', async () => {
      const mockResponse = { data: { deals: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      await shoppingApi.getDeals({ category: 'electronics' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/deals?category=electronics');
    });
  });

  describe('getCoupons', () => {
    it('should call get endpoint', async () => {
      const mockResponse = { data: { coupons: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.getCoupons();

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/coupons?activeOnly=true');
      expect(result).toEqual(mockResponse);
    });

    it('should call get endpoint with activeOnly=false', async () => {
      const mockResponse = { data: { coupons: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      await shoppingApi.getCoupons(false);

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/coupons?activeOnly=false');
    });
  });

  describe('searchProducts', () => {
    it('should call get endpoint with query', async () => {
      const mockResponse = { data: { products: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.searchProducts({ q: 'iPhone' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/products?q=iPhone');
      expect(result).toEqual(mockResponse);
    });

    it('should call get endpoint with store', async () => {
      const mockResponse = { data: { products: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      await shoppingApi.searchProducts({ q: 'iPhone', store: 'amazon' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/products?q=iPhone&store=amazon');
    });
  });

  describe('getAlerts', () => {
    it('should call get endpoint', async () => {
      const mockResponse = { data: { alerts: [] } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.getAlerts();

      expect(apiClient.get).toHaveBeenCalledWith('/api/shopping/alerts');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createAlert', () => {
    it('should call post endpoint with data', async () => {
      const mockData = { name: 'iPhone 15', type: 'price_drop', target_price: 7999 };
      const mockResponse = { data: { id: '1', ...mockData } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.createAlert(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/shopping/alerts', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeAlert', () => {
    it('should call delete endpoint with id', async () => {
      const mockResponse = { data: { message: 'Removed' } };
      (apiClient.delete as any).mockResolvedValue(mockResponse);

      const result = await shoppingApi.removeAlert('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/shopping/alerts?id=1');
      expect(result).toEqual(mockResponse);
    });
  });
});
