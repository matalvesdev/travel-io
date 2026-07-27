import { describe, it, expect, vi, beforeEach } from 'vitest';
import { milesApi } from '@/lib/api/miles';
import {
  mockMilesBalanceResponse,
  mockTransferRoutes,
  mockMilesTransfer,
  mockPromotions,
} from './__fixtures__/miles';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api/client';

describe('Miles API Client', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getBalance', () => {
    it('should call get /api/miles', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockMilesBalanceResponse });

      const result = await milesApi.getBalance();

      expect(apiClient.get).toHaveBeenCalledWith('/api/miles');
      expect(result).toEqual({ data: mockMilesBalanceResponse });
    });

    it('should call get /api/miles with program filter', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockMilesBalanceResponse });

      const result = await milesApi.getBalance('SMILES');

      expect(apiClient.get).toHaveBeenCalledWith('/api/miles?program=SMILES');
      expect(result).toEqual({ data: mockMilesBalanceResponse });
    });
  });

  describe('linkAccount', () => {
    it('should call post /api/miles with data', async () => {
      const data = { program: 'SMILES', accountNumber: '12345', miles: 10000 };
      const mockResponse = { data: { id: '1', ...data } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await milesApi.linkAccount(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/miles', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAccount', () => {
    it('should call patch /api/miles with data', async () => {
      const data = { id: '1', balance: 25000 };
      const mockResponse = { data: { id: '1', balance: 25000 } };
      (apiClient.patch as any).mockResolvedValue(mockResponse);

      const result = await milesApi.updateAccount(data);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/miles', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAccount', () => {
    it('should call delete /api/miles?id=', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: undefined });

      const result = await milesApi.deleteAccount('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/miles?id=1');
      expect(result).toEqual({ data: undefined });
    });
  });

  describe('transferMiles', () => {
    it('should call post /api/miles/transfer', async () => {
      const data = { fromProgram: 'SMILES', toProgram: 'LATAM_PASS', miles: 20000 };
      (apiClient.post as any).mockResolvedValue({ data: mockMilesTransfer });

      const result = await milesApi.transferMiles(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/miles/transfer', data);
      expect(result).toEqual({ data: mockMilesTransfer });
    });
  });

  describe('getPromotions', () => {
    it('should call get /api/miles/promotions', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockPromotions });

      const result = await milesApi.getPromotions();

      expect(apiClient.get).toHaveBeenCalledWith('/api/miles/promotions');
      expect(result).toEqual({ data: mockPromotions });
    });
  });

  describe('getTransferHistory', () => {
    it('should call get /api/miles/transfer?history=true', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [mockMilesTransfer] });

      const result = await milesApi.getTransferHistory();

      expect(apiClient.get).toHaveBeenCalledWith('/api/miles/transfer?history=true');
      expect(result).toEqual({ data: [mockMilesTransfer] });
    });
  });

  describe('getTransferRoutes', () => {
    it('should call get /api/miles/transfer/routes', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockTransferRoutes });

      const result = await milesApi.getTransferRoutes();

      expect(apiClient.get).toHaveBeenCalledWith('/api/miles/transfer/routes');
      expect(result).toEqual({ data: mockTransferRoutes });
    });
  });
});
