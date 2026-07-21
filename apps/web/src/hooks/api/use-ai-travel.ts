'use client';

import { useMutation } from '@tanstack/react-query';
import { aiTravelApi } from '@/lib/api/ai-travel';

export function useAiTravelResponse() {
  return useMutation({
    mutationFn: async (params: { destination: string }) => {
      const [seasonRes, savingsRes] = await Promise.all([
        aiTravelApi.getSeasonalData(params.destination),
        aiTravelApi.getSavingsPlan(params.destination),
      ]);
      return {
        seasonal: seasonRes.data,
        savingsPlans: savingsRes.data.savingsPlans,
        estimatedCost: savingsRes.data.estimatedCost,
      };
    },
  });
}
