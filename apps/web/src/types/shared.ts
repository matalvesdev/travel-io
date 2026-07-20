// Shared types - copied from @travelio/shared for Vercel compatibility
// TODO: Remove when monorepo build is configured for Vercel

// === API ===
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// === Auth ===
export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
}

// === Finance ===
export interface Account {
  id: string;
  type: string;
  name: string;
  bank: string;
  agency: string;
  number: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  includeInTotal: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  note: string;
  transactionDate: string;
  paymentMethod: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  isPaid: boolean;
  dueDate: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  period: string;
  percentageUsed: number;
  isOverBudget: boolean;
  categoryId: string;
  alertPercentage: number;
  shouldAlert: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  amount: number;
  billingCycle: string;
  nextBillingDate: string;
  logoUrl: string;
  isActive: boolean;
  monthlyCost: number;
  yearlyCost: number;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  method?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export interface CreateAccountRequest {
  type: string;
  name: string;
  bank?: string;
  agency?: string;
  number?: string;
  color?: string;
  icon?: string;
  includeInTotal?: boolean;
}

export interface CreateTransactionRequest {
  type: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  description?: string;
  note?: string;
  transactionDate: string;
  paymentMethod?: string;
  transferToAccountId?: string;
}

// === Investments ===
export interface Investment {
  id: string;
  type: string;
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  exchange: string;
  sector: string;
  currency: string;
  isActive: boolean;
  costBasis: number;
}

export interface Allocation {
  totalValue: number;
  items: AllocationItem[];
  byType: Record<string, number>;
  bySector: Record<string, number>;
}

export interface AllocationItem {
  category: string;
  value: number;
  percentage: number;
  count: number;
}

export interface Dividend {
  id: string;
  ticker: string;
  type: string;
  amount: number;
  quantity: number;
  valuePerUnit: number;
  paymentDate: string;
  exDate: string;
  status: string;
}

export interface CreateInvestmentRequest {
  type: string;
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  exchange?: string;
  sector?: string;
  currency?: string;
}

// === Travel ===
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  totalCost: number;
  notes: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  imageUrl: string;
  amenities: string[];
}

export interface CreateTripRequest {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface CreateFlightRequest {
  tripId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency?: string;
}

export interface CreateHotelRequest {
  tripId: string;
  name: string;
  address: string;
  price: number;
  rating?: number;
}

export interface CreatePriceAlertRequest {
  origin: string;
  destination: string;
  targetPrice: number;
  currency?: string;
}

export interface FlightSearchResult {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber: string;
  stops: number;
  duration: string;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  address: string;
  price: number;
  currency: string;
  rating: number;
  amenities: string[];
}

export interface LocationResult {
  id: string;
  name: string;
  iataCode: string;
  type: string;
  cityName: string;
  countryName: string;
}

// === Miles ===
export interface MilesAccount {
  id: string;
  program: string;
  programName: string;
  holderName: string;
  balance: number;
  expiringIn30Days: number;
  expiringDate: string;
  tier: string;
  milesValue: number;
  monetaryValue: number;
}

export interface TransferRoute {
  id: string;
  fromProgram: string;
  fromProgramName: string;
  toProgram: string;
  toProgramName: string;
  conversionRate: number;
  bonusPercentage: number;
  minTransfer: number;
  maxTransfer: number;
  transferFee: number;
  processingTimeHours: number;
  hasPromo: boolean;
  promoEndDate: string;
  notes: string;
}

export interface Promotion {
  id: string;
  program: string;
  programName: string;
  title: string;
  description: string;
  bonusPercentage: number;
  bonusMiles: number;
  partner: string;
  category: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  termsUrl: string;
  linkUrl: string;
}

export interface LinkMilesAccountRequest {
  program: string;
  holderName: string;
  accountNumber?: string;
  email?: string;
}

// === Shopping ===
export interface Wishlist {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDefault: boolean;
  items: WishlistItem[];
  itemCount: number;
  totalValue: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  store: string;
  currentPrice: number;
  targetPrice: number;
  lowestPrice: number;
  category: string;
  brand: string;
  status: string;
  priority: number;
  monitorPrice: boolean;
  hasPriceAlert: boolean;
  savingsPercentage: number;
}

export interface Deal {
  id: string;
  storeName: string;
  productName: string;
  description: string;
  url: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  savings: number;
  category: string;
  brand: string;
  couponCode: string;
  isActive: boolean;
  isVerified: boolean;
  netVotes: number;
}

export interface Coupon {
  id: string;
  storeName: string;
  code: string;
  description: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  isUsable: boolean;
  isVerified: boolean;
  successRate: number;
}

export interface CreateWishlistRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface AddToWishlistRequest {
  wishlistId?: string;
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  store?: string;
  currentPrice?: number;
  targetPrice?: number;
  category?: string;
  brand?: string;
  monitorPrice?: boolean;
}

// === Goals ===
export interface Milestone {
  id: string;
  name: string;
  targetPercentage: number;
  targetAmount: number;
  isCompleted: boolean;
  completedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  type: string;
  typeName: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  monthlyContribution: number;
  startDate: string;
  targetDate: string;
  daysRemaining: number;
  monthsRemaining: number;
  priority: string;
  status: string;
  isOnTrack: boolean;
  isExpired: boolean;
  isCompleted: boolean;
  requiredMonthlyContribution: number;
  estimatedCompletionDate: string;
  milestones: Milestone[];
  progressHistoryCount: number;
}

export interface GoalTemplate {
  name: string;
  description: string;
  type: string;
  typeName: string;
  icon: string;
  color: string;
  suggestedAmount: number;
  suggestedMonths: number;
  suggestedMonthlyContribution: number;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  type: string;
  targetAmount: number;
  targetDate: string;
  monthlyContribution?: number;
  priority?: string;
  expectedReturnRate?: number;
}

export interface AddGoalProgressRequest {
  goalId: string;
  amount: number;
  description?: string;
  type?: string;
}

// === AI ===
export interface Conversation {
  id: string;
  title: string;
  agentType: string;
  status: string;
  messageCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  tokensUsed: number;
  modelUsed: string;
  processingTimeMs: number;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
}

export interface CreateConversationRequest {
  agentType?: string;
}

// === Notifications ===
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

// === Admin ===
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string;
  limits: string;
  isPopular: boolean;
  yearlySavings: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  type: string;
  rolloutPercentage: number;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  components: Record<string, {
    name: string;
    status: string;
    message: string;
    responseTimeMs: number;
  }>;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalInvestments: number;
    activeGoals: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
}

export interface ToggleFeatureFlagRequest {
  key: string;
  enabled?: boolean;
}

// === Profile ===
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface ProfileData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
}

// === Settings ===
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  email: string;
  status: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface SettingsPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isCurrent: boolean;
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

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

// === Analytics ===
export interface Insight {
  id: string;
  title: string;
  description: string;
  priority: string;
}

export interface ForecastItem {
  month: string;
  forecast: number;
  confidence: number;
}

// === Dashboard ===
export interface PatrimonyItem {
  category: string;
  value: number;
  percentage: number;
  variation: number;
}

export interface Patrimony {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  items: PatrimonyItem[];
  monthlyVariation: number;
  yearlyVariation: number;
}

export interface CashFlowItem {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface CashFlow {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeItems: CashFlowItem[];
  expenseItems: CashFlowItem[];
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface GoalProgress {
  goalId: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  status: string;
  daysRemaining: number | null;
}

export interface InvestmentAllocation {
  type: string;
  value: number;
  percentage: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  allocations: InvestmentAllocation[];
}

export interface TravelSummary {
  upcomingTrips: number;
  completedTrips: number;
  totalSpent: number;
  plannedBudget: number;
  nextDestination: string | null;
  nextDeparture: string | null;
}

export interface MilesBalance {
  program: string;
  balance: number;
  expiringIn30Days: number;
}

export interface MilesSummary {
  totalMiles: number;
  expiringMiles: number;
  milesValue: number;
  balances: MilesBalance[];
}

export interface BestDeal {
  product: string;
  store: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
}

export interface ShoppingSummary {
  wishlistItems: number;
  priceAlerts: number;
  potentialSavings: number;
  bestDeals: BestDeal[];
}

export interface DashboardInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  action: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string | null;
}

export interface CategoryChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CashFlowChartData {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardData {
  userId: string;
  totalPatrimony: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  savingsRate: number;
  investmentReturn: number;
  totalDebts: number;
  netWorth: number;
  patrimony: Patrimony;
  cashFlow: CashFlow;
  goals: GoalProgress[];
  investments: InvestmentSummary;
  travel: TravelSummary;
  miles: MilesSummary;
  shopping: ShoppingSummary;
  insights: DashboardInsight[];
  lastUpdated: string;
}
