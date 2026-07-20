'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const result = await dashboardApi.getSummary();
        if (result.success && result.data) return result.data;
      } catch {}
      return {
        financialSummary: { totalRevenue: 0, totalExpenses: 0, balance: 0, totalInvested: 0, totalPortfolio: 0 },
        goals: { total: 0, completed: 0 },
        trips: { planned: 0, completed: 0 },
        barData: [],
        categoryBreakdown: [],
        cashFlowTrend: [],
        transactions: [],
      };
    },
    refetchInterval: 300000,
  });
}
