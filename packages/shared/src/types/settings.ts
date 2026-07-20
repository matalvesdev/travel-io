export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Session {
  id: string;
  deviceType: string;
  userAgent: string;
  ipAddress: string;
  lastActiveAt: string;
  expiresAt: string;
  active: boolean;
  current?: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  loginAt: string;
  userAgent: string;
  ipAddress: string;
  status: string;
  location: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface SettingsPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  isPopular: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  whatsapp: boolean;
  priceAlerts: boolean;
  travelDeals: boolean;
  investmentAlerts: boolean;
  marketing: boolean;
}
