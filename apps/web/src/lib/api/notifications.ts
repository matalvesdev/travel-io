import { apiClient, type ApiResponse } from './client';
import type { Notification, NotificationPreference } from '@/types/shared';

export type { Notification, NotificationPreference };

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface UpdatePreferencesRequest {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  telegramEnabled?: boolean;
  budgetAlerts?: boolean;
  priceAlerts?: boolean;
  travelDeals?: boolean;
  goalReminders?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: number;
  quietHoursEnd?: number;
}

export const notificationsApi = {
  getNotifications: (filter = 'ALL') => {
    const query = filter !== 'ALL' ? `?filter=${filter}` : '';
    return apiClient.get<ApiResponse<NotificationsResponse>>(`/api/notifications${query}`);
  },

  markAsRead: (notificationId: string) =>
    apiClient.put<ApiResponse<{ success: boolean }>>('/api/notifications/read', { notificationId }),

  updatePreferences: (data: UpdatePreferencesRequest) =>
    apiClient.put<ApiResponse<{ success: boolean }>>('/api/notifications/preferences', data),
};
