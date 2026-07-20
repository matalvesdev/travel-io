'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingApi } from '@/lib/api';

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
    mutationFn: (data: { name: string; store: string; current_price: number; target_price?: number; url?: string; image_url?: string }) =>
      shoppingApi.addToWishlist(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }); },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.removeFromWishlist(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }); },
  });
}

export function useDeals(category?: string) {
  return useQuery({
    queryKey: ['deals', category],
    queryFn: () => shoppingApi.getDeals({ category }),
    select: (data) => data.data,
  });
}

export function useCoupons(activeOnly = true) {
  return useQuery({
    queryKey: ['coupons', activeOnly],
    queryFn: () => shoppingApi.getCoupons(activeOnly),
    select: (data) => data.data,
  });
}
