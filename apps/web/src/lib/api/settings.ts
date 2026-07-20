import type { ChangePasswordRequest, Session, LoginHistoryEntry, SettingsPlan, PaymentMethod, NotificationPreferences } from '@/types/shared';
import { apiClient, type ApiResponse } from './client';

export type { ChangePasswordRequest, Session, LoginHistoryEntry, SettingsPlan, PaymentMethod, NotificationPreferences };

const BASE = '/api/settings';

export async function changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`${BASE}/password`, data);
}

export async function getSessions(): Promise<ApiResponse<{ sessions: Session[]; totalActive: number }>> {
  return apiClient.get(`${BASE}/sessions`);
}

export async function deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`${BASE}/sessions?id=${sessionId}`);
}

export async function getLoginHistory(): Promise<ApiResponse<{ entries: LoginHistoryEntry[]; total: number }>> {
  return apiClient.get(`${BASE}/login-history`);
}

export async function getPlans(): Promise<ApiResponse<{ plans: SettingsPlan[]; currentPlan: string }>> {
  return apiClient.get(`${BASE}/plans`);
}

export async function changePlan(planId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`${BASE}/plans`, { planId });
}

export async function getPaymentMethod(): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> {
  return apiClient.get(`${BASE}/payment`);
}

export async function updatePaymentMethod(data: { cardNumber: string; expiryMonth: string; expiryYear: string; cvv: string; name: string }): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`${BASE}/payment`, data);
}

export async function deletePaymentMethod(): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`${BASE}/payment`);
}
