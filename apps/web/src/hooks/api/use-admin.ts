'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => adminApi.getFeatureFlags(),
    select: (data) => data.data,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => adminApi.getSystemHealth(),
    select: (data) => data.data,
    refetchInterval: 30000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => adminApi.getPlans(),
    select: (data) => data.data,
  });
}
