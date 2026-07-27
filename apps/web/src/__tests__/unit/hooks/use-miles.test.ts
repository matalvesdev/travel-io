import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useMilesBalance,
  useLinkAccount,
  useUpdateAccount,
  useTransferMiles,
  usePromotions,
  useTransferHistory,
  useTransferRoutes,
  useDeleteAccount,
} from '@/hooks/api/use-miles';
import { milesApi } from '@/lib/api';
import {
  mockMilesBalanceResponse,
  mockTransferRoutes,
  mockPromotions,
} from '@/__tests__/unit/miles/__fixtures__/miles';

vi.mock('@/lib/api', () => ({
  milesApi: {
    getBalance: vi.fn(),
    linkAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    transferMiles: vi.fn(),
    getPromotions: vi.fn(),
    getTransferHistory: vi.fn(),
    getTransferRoutes: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Miles Hooks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('useMilesBalance', () => {
    it('should fetch miles balance', async () => {
      (milesApi.getBalance as any).mockResolvedValue({ data: mockMilesBalanceResponse });

      const { result } = renderHook(() => useMilesBalance(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(milesApi.getBalance).toHaveBeenCalledWith(undefined);
    });

    it('should fetch miles balance filtered by program', async () => {
      (milesApi.getBalance as any).mockResolvedValue({ data: mockMilesBalanceResponse });

      const { result } = renderHook(() => useMilesBalance('SMILES'), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(milesApi.getBalance).toHaveBeenCalledWith('SMILES');
    });
  });

  describe('useLinkAccount', () => {
    it('should link a new account', async () => {
      (milesApi.linkAccount as any).mockResolvedValue({ data: { id: '1' } });

      const { result } = renderHook(() => useLinkAccount(), { wrapper: createWrapper() });

      result.current.mutate({ program: 'SMILES', accountNumber: '12345', miles: 10000 });

      await waitFor(() => { expect(milesApi.linkAccount).toHaveBeenCalled(); });
      expect(milesApi.linkAccount).toHaveBeenCalledWith({ program: 'SMILES', accountNumber: '12345', miles: 10000 });
    });
  });

  describe('useUpdateAccount', () => {
    it('should update an account', async () => {
      (milesApi.updateAccount as any).mockResolvedValue({ data: { id: '1' } });

      const { result } = renderHook(() => useUpdateAccount(), { wrapper: createWrapper() });

      result.current.mutate({ id: '1', balance: 50000 });

      await waitFor(() => { expect(milesApi.updateAccount).toHaveBeenCalled(); });
      expect(milesApi.updateAccount).toHaveBeenCalledWith({ id: '1', balance: 50000 });
    });
  });

  describe('useDeleteAccount', () => {
    it('should delete an account', async () => {
      (milesApi.deleteAccount as any).mockResolvedValue({});

      const { result } = renderHook(() => useDeleteAccount(), { wrapper: createWrapper() });

      result.current.mutate('1');

      await waitFor(() => { expect(milesApi.deleteAccount).toHaveBeenCalledWith('1'); });
    });
  });

  describe('useTransferMiles', () => {
    it('should transfer miles', async () => {
      (milesApi.transferMiles as any).mockResolvedValue({ data: { id: '1' } });

      const { result } = renderHook(() => useTransferMiles(), { wrapper: createWrapper() });

      result.current.mutate({ fromProgram: 'SMILES', toProgram: 'LATAM_PASS', miles: 20000 });

      await waitFor(() => { expect(milesApi.transferMiles).toHaveBeenCalled(); });
    });
  });

  describe('usePromotions', () => {
    it('should fetch promotions', async () => {
      (milesApi.getPromotions as any).mockResolvedValue({ data: mockPromotions });

      const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(milesApi.getPromotions).toHaveBeenCalled();
    });
  });

  describe('useTransferHistory', () => {
    it('should fetch transfer history', async () => {
      (milesApi.getTransferHistory as any).mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useTransferHistory(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(milesApi.getTransferHistory).toHaveBeenCalled();
    });
  });

  describe('useTransferRoutes', () => {
    it('should fetch transfer routes', async () => {
      (milesApi.getTransferRoutes as any).mockResolvedValue({ data: mockTransferRoutes });

      const { result } = renderHook(() => useTransferRoutes(), { wrapper: createWrapper() });

      await waitFor(() => { expect(result.current.data).toBeDefined(); });
      expect(milesApi.getTransferRoutes).toHaveBeenCalled();
    });
  });
});
