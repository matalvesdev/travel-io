import { apiClient, type ApiResponse } from './client';
import type { Plan, FeatureFlag, AuditLog } from '@/types/shared';

export type { Plan, FeatureFlag, AuditLog };

export const adminApi = {
  getPlans: (includeInactive = false) =>
    apiClient.get<ApiResponse<{ plans: Plan[] }>>(`/api/admin/plans?includeInactive=${includeInactive}`),

  getFeatureFlags: (activeOnly = false) =>
    apiClient.get<ApiResponse<{ flags: FeatureFlag[] }>>(`/api/admin/feature-flags?activeOnly=${activeOnly}`),

  getAuditLogs: (params?: { userId?: string; entityType?: string; action?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.action) searchParams.set('action', params.action);
    const query = searchParams.toString();
    return apiClient.get<ApiResponse<{ logs: AuditLog[] }>>(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  getSystemHealth: () =>
    apiClient.get<ApiResponse<{ status: string; uptime: number; version: string }>>('/api/admin/health'),
};
