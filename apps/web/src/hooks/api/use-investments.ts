'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsApi, type Investment } from '@/lib/api';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: () => investmentsApi.getPortfolio(),
    select: (data) => data.data,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Investment>) => investmentsApi.createInvestment(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolio'] }); },
  });
}
