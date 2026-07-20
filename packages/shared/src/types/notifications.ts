export interface Notification {
  id: string;
  channel: string;
  channelName: string;
  type: string;
  typeName: string;
  title: string;
  body: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  readAt: string;
}

export interface NotificationPreference {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  discordEnabled: boolean;
  budgetAlerts: boolean;
  billReminders: boolean;
  priceAlerts: boolean;
  travelDeals: boolean;
  milesAlerts: boolean;
  investmentAlerts: boolean;
  goalReminders: boolean;
  aiInsights: boolean;
  marketing: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

export interface SendNotificationRequest {
  channel: string;
  type: string;
  title: string;
  body: string;
  userId?: string;
}

export interface MarkAsReadRequest {
  notificationId?: string;
  markAll?: boolean;
}
