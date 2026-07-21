'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import type { MonthlyDataEntry, CategoryBreakdownEntry, AnalyticsInsight, AnalyticsForecast } from '@/lib/api/analytics';

interface AnalyticsSummary {
  insights: AnalyticsInsight[];
  monthlyData: MonthlyDataEntry[];
  categoryBreakdown: CategoryBreakdownEntry[];
}

interface ForecastData {
  forecast: AnalyticsForecast[];
}

export function useAnalyticsSummary(period?: string) {
  return useQuery({
    queryKey: ['analytics', 'summary', period],
    queryFn: async () => {
      try {
        const result = await analyticsApi.getInsights();
        if (result.success && result.data) return result.data as AnalyticsSummary;
      } catch {}
      return { insights: [], monthlyData: [], categoryBreakdown: [] } as AnalyticsSummary;
    },
    refetchInterval: 300000,
  });
}

export function useMonthlyData(period?: string) {
  const { data, ...rest } = useAnalyticsSummary(period);
  return {
    data: data?.monthlyData ?? [],
    ...rest,
  };
}

export function useCategoryBreakdown(period?: string) {
  const { data, ...rest } = useAnalyticsSummary(period);
  return {
    data: data?.categoryBreakdown ?? [],
    ...rest,
  };
}

export function useForecast(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'forecast', months],
    queryFn: async () => {
      try {
        const result = await analyticsApi.getForecast();
        if (result.success && result.data) {
          return (result.data as ForecastData).forecast.map((f) => ({
            month: f.period,
            forecast: f.value,
            confidence: f.confidence,
          }));
        }
      } catch {}
      return [] as Array<{ month: string; forecast: number; confidence: number }>;
    },
    refetchInterval: 300000,
  });
}
