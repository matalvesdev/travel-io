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
