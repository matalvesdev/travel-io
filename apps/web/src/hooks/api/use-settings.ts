'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type ChangePasswordRequest } from '@/lib/api/settings';
import { notificationsApi, type UpdatePreferencesRequest } from '@/lib/api/notifications';

export function useSettings() {
  return useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: () => settingsApi.getSessions(),
    select: (data) => data.data,
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: () => settingsApi.getSessions(),
    select: (data) => data.data,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => settingsApi.deleteSession(sessionId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] }); },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsApi.changePassword(data),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => notificationsApi.updatePreferences(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });
}
