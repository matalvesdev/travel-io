'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';

export function useNotifications(filter = 'ALL') {
  return useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationsApi.getNotifications(filter),
    select: (data) => data.data,
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });
}
