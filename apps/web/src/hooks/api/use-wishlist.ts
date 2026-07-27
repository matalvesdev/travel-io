'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api/wishlist';

export function useWishlist(type?: string) {
  return useQuery({
    queryKey: ['wishlist', type],
    queryFn: () => wishlistApi.getItems(type),
    select: (data) => data.data?.items ?? [],
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => wishlistApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => wishlistApi.updateItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wishlistApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
