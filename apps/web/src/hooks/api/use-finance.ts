'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, type CreateTransactionRequest } from '@/lib/api';

export function useTransactions(params?: {
  accountId?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financeApi.getTransactions(params),
    select: (data) => data.data,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => financeApi.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
