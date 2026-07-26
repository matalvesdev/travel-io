import { apiClient, type ApiResponse } from './client';

export interface BudgetResponse {
  budgets: Array<{
    id: string;
    userId: string;
    category: string;
    limit: number;
    month: number;
    year: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface BudgetSummaryResponse {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  categories: Array<{
    id: string;
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
  }>;
}

export interface BudgetHistoryResponse {
  history: Array<{
    month: number;
    year: number;
    totalBudget: number;
    totalSpent: number;
    categories: Array<{
      category: string;
      budget: number;
      spent: number;
    }>;
  }>;
}

interface CreateBudgetPayload {
  category: string;
  limit: number;
  month: number;
  year: number;
}

interface UpdateBudgetPayload {
  id: string;
  limit: number;
}

export const budgetApi = {
  getBudgets: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    return apiClient.get<ApiResponse<BudgetResponse>>(`/api/budget?${params}`);
  },

  createBudget: (data: CreateBudgetPayload) =>
    apiClient.post<ApiResponse<{ id: string; limit: number }>>('/api/budget', data),

  updateBudget: (data: UpdateBudgetPayload) =>
    apiClient.put<ApiResponse<{ id: string; limit: number }>>('/api/budget', data),

  deleteBudget: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/budget?id=${id}`),

  getSummary: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    return apiClient.get<ApiResponse<BudgetSummaryResponse>>(`/api/budget/summary?${params}`);
  },

  getHistory: () =>
    apiClient.get<ApiResponse<BudgetHistoryResponse>>('/api/budget/history'),
};
