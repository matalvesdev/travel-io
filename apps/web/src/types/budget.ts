export type BudgetStatus = 'safe' | 'warning' | 'danger';
export type BudgetAlertType = 'warning' | 'danger';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface CreateBudgetInput {
  category: string;
  limit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  limit: number;
}

export interface BudgetAlert {
  id: string;
  category: string;
  type: BudgetAlertType;
  message: string;
  createdAt: string;
}

export interface BudgetSummaryCategory {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  status: BudgetStatus;
  categories: BudgetSummaryCategory[];
}

export interface BudgetHistoryItem {
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  categories: {
    category: string;
    budget: number;
    spent: number;
  }[];
}
