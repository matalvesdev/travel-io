export { apiClient } from './client';

export { financeApi } from './finance';
export type { Transaction, CreateTransactionRequest, TransactionsResponse } from './finance';

export { investmentsApi } from './investments';
export type { Investment, PortfolioResponse } from './investments';

export { travelApi } from './travel';
export type { Trip, CreateTripRequest, FlightSearchResult, LocationResult } from './travel';

export { milesApi } from './miles';
export type { MilesAccount, MilesBalanceResponse } from './miles';

export { shoppingApi } from './shopping';
export type { Deal, Coupon, ShoppingWishlistItem } from './shopping';

export { goalsApi } from './goals';
export type { Goal, GoalsResponse } from './goals';

export { aiApi } from './ai';
export type { Conversation, Message, SendMessageRequest, ConversationsResponse, MessagesResponse, SendMessageResponse } from './ai';

export { analyticsApi } from './analytics';
export type { AnalyticsInsight, AnalyticsForecast, MonthlyDataEntry, CategoryBreakdownEntry } from './analytics';

export { notificationsApi } from './notifications';
export type { Notification, NotificationPreference, NotificationsResponse, UpdatePreferencesRequest } from './notifications';

export { adminApi } from './admin';
export type { Plan, FeatureFlag, AuditLog } from './admin';

export { profileApi } from './profile';
export type { ProfileData } from './profile';

export { dashboardApi } from './dashboard';
export type { DashboardSummary, BarDataEntry, TransactionEntry } from './dashboard';

export { alertsApi } from './alerts';
export type { PriceAlert, AlertsResponse } from './alerts';

export { referenceDataApi } from './reference-data';
export type { TravelReferenceData, MilesProgram, MilesRate, CreditCardMiles, DestinationAttractions, CuratedPromo, FuelData } from './reference-data';

export { tripsApi } from './trips';
export type { Trip as TripType } from './trips';
