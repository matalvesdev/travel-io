'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '@/lib/api/budget';

export function useBudgets(month?: number, year?: number) {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetApi.getBudgets(month, year),
    select: (data) => data.data?.budgets ?? [],
  });
}

export function useBudgetSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['budget-summary', month, year],
    queryFn: () => budgetApi.getSummary(month, year),
    select: (data) => data.data,
  });
}

export function useBudgetHistory() {
  return useQuery({
    queryKey: ['budget-history'],
    queryFn: () => budgetApi.getHistory(),
    select: (data) => data.data,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; limit: number; month: number; year: number }) =>
      budgetApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-history'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; limit: number }) =>
      budgetApi.updateBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-history'] });
    },
  });
}
