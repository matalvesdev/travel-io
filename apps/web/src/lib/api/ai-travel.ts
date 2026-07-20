import { apiClient } from './client';

export interface SeasonalData {
  best: string;
  worst: string;
  avgDiscount: number;
  tips: string[];
}

export interface SavingsPlan {
  title: string;
  strategy: string;
  savings: number;
  timeline: string;
}

export interface SavingsPlanResponse {
  destination: string;
  estimatedCost: number;
  savingsPlans: SavingsPlan[];
}

export const aiTravelApi = {
  getSeasonalData: (destination: string) =>
    apiClient.get<{ success: true; data: SeasonalData }>(
      `/api/travel/seasonal-data?destination=${encodeURIComponent(destination)}`
    ),

  getSavingsPlan: (destination: string, totalCost?: number, budget?: number) => {
    const params = new URLSearchParams({ destination });
    if (totalCost) params.set('totalCost', String(totalCost));
    if (budget) params.set('budget', String(budget));
    return apiClient.get<{ success: true; data: SavingsPlanResponse }>(
      `/api/travel/savings-plan?${params.toString()}`
    );
  },
};
