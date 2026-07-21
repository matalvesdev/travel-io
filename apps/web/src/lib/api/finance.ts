import { apiClient, type ApiResponse } from './client';
import type { Transaction, CreateTransactionRequest } from '@/types/shared';

export type { Transaction, CreateTransactionRequest };

export interface TransactionsResponse {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export const financeApi = {
  getTransactions: (params?: { accountId?: string; categoryId?: string; type?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.accountId) searchParams.set('accountId', params.accountId);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return apiClient.get<ApiResponse<TransactionsResponse>>(`/api/finance/transactions${query ? `?${query}` : ''}`);
  },

  createTransaction: (data: CreateTransactionRequest) =>
    apiClient.post<ApiResponse<{ transactionId: string }>>('/api/finance/transactions', data),

  updateTransaction: (id: string, data: Partial<CreateTransactionRequest>) =>
    apiClient.put<ApiResponse<{ success: boolean }>>(`/api/finance/transactions?id=${id}`, data),

  deleteTransaction: (id: string) =>
    apiClient.delete<ApiResponse<{ success: boolean }>>(`/api/finance/transactions?id=${id}`),

  importTransactions: (transactions: CreateTransactionRequest[]) =>
    apiClient.post<ApiResponse<{ imported: number }>>('/api/finance/transactions/import', { transactions }),
};
