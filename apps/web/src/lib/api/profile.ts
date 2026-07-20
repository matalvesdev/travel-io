import { apiClient, type ApiResponse } from './client';
import type { ProfileData } from '@/types/shared';

export type { ProfileData };

export const profileApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<ProfileData>>('/api/profile'),

  updateProfile: (data: Partial<ProfileData>) =>
    apiClient.put<ApiResponse<ProfileData>>('/api/profile', data),
};
