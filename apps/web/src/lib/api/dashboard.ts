import { apiClient, type ApiResponse } from './client';

export interface BarDataEntry {
  name: string;
  Receita: number;
  Despesa: number;
}

export interface CategoryBreakdownEntry {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CashFlowTrendEntry {
  month: string;
  income: number;
  expenses: number;
}

export interface TransactionEntry {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface DashboardSummary {
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    totalInvested: number;
    totalPortfolio: number;
  };
  goals: { total: number; completed: number };
  trips: { planned: number; completed: number };
  barData: BarDataEntry[];
  categoryBreakdown: CategoryBreakdownEntry[];
  cashFlowTrend: CashFlowTrendEntry[];
  transactions: TransactionEntry[];
}

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<ApiResponse<DashboardSummary>>('/api/dashboard'),
};
