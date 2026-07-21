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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Investment>) => investmentsApi.createInvestment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => investmentsApi.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useQuotes(symbols: string) {
  return useQuery({
    queryKey: ['quotes', symbols],
    queryFn: async () => {
      const res = await fetch(`/api/brapi?symbols=${symbols}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    },
    staleTime: 60000,
  });
}
