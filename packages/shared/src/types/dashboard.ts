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

export interface DashboardInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  action: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string | null;
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
