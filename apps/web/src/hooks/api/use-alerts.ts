'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, type PriceAlert } from '@/lib/api';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    select: (data) => data.data,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PriceAlert>) => alertsApi.createAlert(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.deleteAlert(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PriceAlert> & { id: string }) => alertsApi.updateAlert(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });
}
