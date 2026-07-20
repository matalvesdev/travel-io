'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { travelApi, type CreateTripRequest } from '@/lib/api';

export function useTrips(filter = 'ALL') {
  return useQuery({
    queryKey: ['trips', filter],
    queryFn: () => travelApi.getTrips(filter),
    select: (data) => data.data,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTripRequest) => travelApi.createTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
