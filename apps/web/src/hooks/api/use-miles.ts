'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milesApi } from '@/lib/api';

export function useMilesBalance(program?: string) {
  return useQuery({
    queryKey: ['milesBalance', program],
    queryFn: () => milesApi.getBalance(program),
    select: (data) => data.data,
  });
}

export function useLinkMilesAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { program: string; accountNumber: string; miles: number }) => milesApi.linkAccount(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['milesBalance'] }); },
  });
}
