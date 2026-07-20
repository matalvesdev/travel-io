export type {
  ApiResponse,
  User,
  Account, Transaction, Budget, Subscription, ParsedTransaction,
  Investment, Allocation, Dividend,
  Trip, Flight, Hotel, FlightSearchResult, HotelSearchResult,
  MilesAccount, TransferRoute, Promotion,
  Wishlist, WishlistItem, Deal, Coupon,
  Goal, Milestone, GoalTemplate,
  Conversation, Message,
  Insight, ForecastItem,
  Notification, NotificationPreference,
  Plan, FeatureFlag, SystemHealth,
  ProfileData,
  DashboardData, DashboardInsight, Patrimony, CashFlow,
  CategoryChartData, CashFlowChartData,
  Session, LoginHistoryEntry, SettingsPlan, PaymentMethod, ChangePasswordRequest,
} from './shared';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
