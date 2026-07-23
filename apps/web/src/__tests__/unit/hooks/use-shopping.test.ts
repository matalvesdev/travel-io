import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useUpdateWishlistItem,
  useMonitors,
  useAddMonitor,
  useRemoveMonitor,
  useUpdateMonitor,
  useDeals,
  useCoupons,
  useSearchProducts,
} from '@/hooks/api/use-shopping';
import { shoppingApi } from '@/lib/api';

// Mock the shopping API
vi.mock('@/lib/api', () => ({
  shoppingApi: {
    getWishlist: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    updateWishlistItem: vi.fn(),
    getMonitors: vi.fn(),
    addMonitor: vi.fn(),
    removeMonitor: vi.fn(),
    updateMonitor: vi.fn(),
    getDeals: vi.fn(),
    getCoupons: vi.fn(),
    searchProducts: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Shopping Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useWishlist', () => {
    it('should fetch wishlist items', async () => {
      const mockData = { data: { items: [{ id: '1', name: 'iPhone 15' }] } };
      (shoppingApi.getWishlist as any).mockResolvedValue(mockData);

      const { result } = renderHook(() => useWishlist(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useAddToWishlist', () => {
    it('should add item to wishlist', async () => {
      const mockItem = { id: '1', name: 'iPhone 15' };
      (shoppingApi.addToWishlist as any).mockResolvedValue({ data: mockItem });

      const { result } = renderHook(() => useAddToWishlist(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'iPhone 15',
        store: 'Amazon',
        current_price: 8999,
      });

      await waitFor(() => {
        expect(shoppingApi.addToWishlist).toHaveBeenCalled();
      });
    });
  });

  describe('useRemoveFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      (shoppingApi.removeFromWishlist as any).mockResolvedValue({});

      const { result } = renderHook(() => useRemoveFromWishlist(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(shoppingApi.removeFromWishlist).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('useUpdateWishlistItem', () => {
    it('should update wishlist item', async () => {
      const mockItem = { id: '1', targetPrice: 7999 };
      (shoppingApi.updateWishlistItem as any).mockResolvedValue({ data: mockItem });

      const { result } = renderHook(() => useUpdateWishlistItem(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', target_price: 7999 });

      await waitFor(() => {
        expect(shoppingApi.updateWishlistItem).toHaveBeenCalled();
      });
    });
  });

  describe('useMonitors', () => {
    it('should fetch monitors', async () => {
      const mockData = { data: { monitors: [{ id: '1', productName: 'iPhone 15' }] } };
      (shoppingApi.getMonitors as any).mockResolvedValue(mockData);

      const { result } = renderHook(() => useMonitors(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useAddMonitor', () => {
    it('should add monitor', async () => {
      const mockMonitor = { id: '1', productName: 'iPhone 15' };
      (shoppingApi.addMonitor as any).mockResolvedValue({ data: mockMonitor });

      const { result } = renderHook(() => useAddMonitor(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        product_name: 'iPhone 15',
        url: 'https://amazon.com',
        target_price: 7999,
      });

      await waitFor(() => {
        expect(shoppingApi.addMonitor).toHaveBeenCalled();
      });
    });
  });

  describe('useRemoveMonitor', () => {
    it('should remove monitor', async () => {
      (shoppingApi.removeMonitor as any).mockResolvedValue({});

      const { result } = renderHook(() => useRemoveMonitor(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(shoppingApi.removeMonitor).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('useUpdateMonitor', () => {
    it('should update monitor', async () => {
      const mockMonitor = { id: '1', currentPrice: 8499 };
      (shoppingApi.updateMonitor as any).mockResolvedValue({ data: mockMonitor });

      const { result } = renderHook(() => useUpdateMonitor(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', current_price: 8499 });

      await waitFor(() => {
        expect(shoppingApi.updateMonitor).toHaveBeenCalled();
      });
    });
  });

  describe('useDeals', () => {
    it('should fetch deals', async () => {
      const mockData = { data: { deals: [{ id: '1', productName: 'iPhone 15' }] } };
      (shoppingApi.getDeals as any).mockResolvedValue(mockData);

      const { result } = renderHook(() => useDeals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useCoupons', () => {
    it('should fetch coupons', async () => {
      const mockData = { data: { coupons: [{ id: '1', code: 'DESCONTO10' }] } };
      (shoppingApi.getCoupons as any).mockResolvedValue(mockData);

      const { result } = renderHook(() => useCoupons(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useSearchProducts', () => {
    it('should search products', async () => {
      const mockData = { data: { products: [{ id: '1', title: 'iPhone 15' }] } };
      (shoppingApi.searchProducts as any).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSearchProducts(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ q: 'iPhone 15' });

      await waitFor(() => {
        expect(shoppingApi.searchProducts).toHaveBeenCalled();
      });
    });
  });
});
