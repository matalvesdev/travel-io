import { apiClient, type ApiResponse } from './client';

export interface AnalyticsInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  createdAt: string;
}

export interface AnalyticsForecast {
  period: string;
  value: number;
  confidence: number;
}

export interface MonthlyDataEntry {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdownEntry {
  name: string;
  value: number;
  color: string;
}

export const analyticsApi = {
  getInsights: () =>
    apiClient.get<ApiResponse<{ insights: AnalyticsInsight[]; monthlyData: MonthlyDataEntry[]; categoryBreakdown: CategoryBreakdownEntry[] }>>('/api/analytics/insights'),

  getForecast: () =>
    apiClient.get<ApiResponse<{ forecast: AnalyticsForecast[] }>>('/api/analytics/forecast'),
};
