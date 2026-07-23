'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingApi } from '@/lib/api';
import type {
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  CreateMonitorRequest,
  UpdateMonitorRequest,
} from '@/types/shopping';

// === Wishlist Hooks ===

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => shoppingApi.getWishlist(),
    select: (data) => data.data,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWishlistItemRequest) =>
      shoppingApi.addToWishlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWishlistItemRequest) =>
      shoppingApi.updateWishlistItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.removeFromWishlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// === Monitor Hooks ===

export function useMonitors() {
  return useQuery({
    queryKey: ['monitors'],
    queryFn: () => shoppingApi.getMonitors(),
    select: (data) => data.data,
  });
}

export function useAddMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMonitorRequest) =>
      shoppingApi.addMonitor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMonitorRequest) =>
      shoppingApi.updateMonitor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

export function useRemoveMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.removeMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

// === Deals Hooks ===

export function useDeals(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => shoppingApi.getDeals(params),
    select: (data) => data.data,
  });
}

// === Coupons Hooks ===

export function useCoupons(activeOnly = true) {
  return useQuery({
    queryKey: ['coupons', activeOnly],
    queryFn: () => shoppingApi.getCoupons(activeOnly),
    select: (data) => data.data,
  });
}

// === Product Search Hook ===

export function useSearchProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { q: string; store?: string }) =>
      shoppingApi.searchProducts(params),
  });
}


