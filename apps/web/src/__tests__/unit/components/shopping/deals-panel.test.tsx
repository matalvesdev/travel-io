import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { DealsPanel } from '@/components/shopping/deals-panel';

// Mock the hooks
vi.mock('@/hooks/api/use-shopping', () => ({
  useDeals: vi.fn(() => ({
    data: {
      deals: [
        {
          id: '1',
          productName: 'iPhone 15',
          storeName: 'Amazon',
          originalPrice: 8999,
          dealPrice: 7999,
          savings: 1000,
          category: 'Eletrônicos',
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

describe('DealsPanel', () => {
  it('should render deals', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
  });

  it('should render store name', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText('Amazon').length).toBeGreaterThan(0);
  });

  it('should render discount badge', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText(/-11%/)).toBeInTheDocument();
  });

  it('should render savings', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText(/R\$ 1.000,00 de economia/)).toBeInTheDocument();
  });

  it('should render category', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
  });

  it('should render store filter', () => {
    render(<DealsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Todas as Lojas')).toBeInTheDocument();
  });
});
