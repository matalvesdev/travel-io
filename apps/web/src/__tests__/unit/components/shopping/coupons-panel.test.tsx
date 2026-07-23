import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CouponsPanel } from '@/components/shopping/coupons-panel';

// Mock the hooks
vi.mock('@/hooks/api/use-shopping', () => ({
  useCoupons: vi.fn(() => ({
    data: {
      coupons: [
        {
          id: '1',
          storeName: 'Amazon',
          code: 'DESCONTO10',
          description: '10% de desconto',
          value: 10,
          minPurchase: 100,
          daysRemaining: 5,
        },
      ],
    },
    isLoading: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('CouponsPanel', () => {
  it('should render coupons', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });

  it('should render coupon code', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('DESCONTO10')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('10% de desconto')).toBeInTheDocument();
  });

  it('should render days remaining', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/5/).length).toBeGreaterThan(0);
  });

  it('should render store filter', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/Amazon/).length).toBeGreaterThan(0);
  });

  it('should render copy button', () => {
    render(<CouponsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Copiar')).toBeInTheDocument();
  });
});
