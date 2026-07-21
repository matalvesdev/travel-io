'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milesApi, type MilesBalanceResponse, type MilesPromotion, type MilesAccount } from '@/lib/api';

export function useMilesBalance(program?: string) {
  return useQuery({
    queryKey: ['milesBalance', program].filter(Boolean),
    queryFn: () => milesApi.getBalance(program),
    select: (data) => data.data,
  });
}

export function useLinkAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { program: string; accountNumber: string; miles: number }) =>
      milesApi.linkAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milesBalance'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MilesAccount> & { id: string }) =>
      milesApi.updateAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milesBalance'] });
    },
  });
}

export function useTransferMiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fromProgram: string; toProgram: string; miles: number }) =>
      milesApi.transferMiles(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milesBalance'] });
      queryClient.invalidateQueries({ queryKey: ['milesTransferHistory'] });
    },
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: ['milesPromotions'],
    queryFn: () => milesApi.getPromotions(),
    select: (data) => data.data,
  });
}

export function useTransferHistory() {
  return useQuery({
    queryKey: ['milesTransferHistory'],
    queryFn: () => milesApi.getTransferHistory(),
    select: (data) => data.data,
  });
}
