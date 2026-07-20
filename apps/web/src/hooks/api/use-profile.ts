'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type ProfileData } from '@/lib/api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    select: (data) => data.data,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProfileData>) => profileApi.updateProfile(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); },
  });
}
