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

export function useMonitors() {
  return useQuery({
    queryKey: ['monitors'],
    queryFn: async () => {
      const res = await fetch('/api/shopping/monitors');
      const json = await res.json();
      return json.success ? json.data.monitors : [];
    },
  });
}

export function useAddMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { product_name: string; url: string; target_price: number; current_price?: number; is_active?: boolean }) =>
      fetch('/api/shopping/monitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['monitors'] }); },
  });
}

export function useRemoveMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/shopping/monitors?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['monitors'] }); },
  });
}
