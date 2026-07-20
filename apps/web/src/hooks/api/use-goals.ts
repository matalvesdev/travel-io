'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi, type Goal } from '@/lib/api';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getGoals(),
    select: (data) => data.data,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Goal>) => goalsApi.createGoal(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Goal> & { id: string }) => goalsApi.updateGoal(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.deleteGoal(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); },
  });
}
